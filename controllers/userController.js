import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabaseClient.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to point to restaurantData.json relative to the controllers folder
const restaurantDataPath = path.join(__dirname, '../data/data.json');

const restaurantData = JSON.parse(fs.readFileSync(restaurantDataPath, 'utf-8'));


// Register user and send game link along with restaurant-specific data
export const registerUser = async (req, res) => {
    const { name, email, phone } = req.body;
    const { restaurantName } = req.query; // Get restaurant name from query parameters

    try {
        // Validate the restaurant name
        if (!restaurantName || !restaurantData[restaurantName.toLowerCase()]) {
            return res.status(400).json({ error: 'Invalid or missing restaurant name.' });
        }

        // Fetch restaurant-specific data
        const restaurant = restaurantData[restaurantName.toLowerCase()];
        const { offers, tableName, winProbability } = restaurant;

        // Remove +91 or 0 from the start of the phone number
        const cleanedPhone = phone.replace(/^(\+91|0)/, '');

        // Check if the user already exists in the database
        const { data: existingUser, error: fetchError } = await supabase
            .from(tableName) // Use the dynamic table name
            .select('*')
            .eq('phone', cleanedPhone)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error(fetchError.message);
            return res.status(500).json({ error: 'Error checking user existence.' });
        }

        if (existingUser) {
            // If the user exists, return their token and latest timestamp along with restaurant offers
            const latestPlayedTimestamp = existingUser.played_on;
            return res.status(200).json({
                message: 'User already registered!',
                token: existingUser.token,
                latestPlayedTimestamp,
                offers,
                tableName,
                winProbability
            });
        }

        // If the user doesn't exist, register them
        const token = uuidv4();

        // Insert user data into the specific table
        const { error } = await supabase
            .from(tableName) // Use the dynamic table name
            .insert([{ name, email, phone: cleanedPhone, token, game_played: false, played_on: null }]);

        if (error) {
            console.error(error.message);
            return res.status(400).json({ error: error.message });
        }

        // Respond with the token and restaurant data, including winProbability
        res.status(200).json({
            message: 'User registered successfully!',
            token,
            offers,
            tableName,
            winProbability
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error registering user.' });
    }
};

/**
 * Mark a game as played.
 */
export const markGamePlayed = async (req, res) => {
    const { token, tableName } = req.body; // Extract tableName from body

    try {
        // Validate tableName
        if (!tableName) {
            return res.status(400).json({ error: 'Missing table name.' });
        }

        // Generate the current timestamp
        const playedOnTimestamp = new Date().toISOString();

        // Update the played_on timestamp column in the specified table
        const { data, error } = await supabase
            .from(tableName) // Use dynamic tableName
            .update({
                game_played: true,
                played_on: playedOnTimestamp, // Set the new timestamp value
            })
            .eq('token', token);

        if (error) {
            console.error('Error updating game_played status:', error);
            return res.status(400).json({ error: 'Error marking game as played.' });
        }

        res.status(200).json({ message: 'Game marked as played!', token });
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({ error: 'Error marking game as played.' });
    }
};

/**
 * Set the rating for a user.
 */
export const setRating = async (req, res) => {
    const { token, rating, tableName } = req.body; // Extract tableName from body

    try {
        // Validate tableName
        if (!tableName) {
            return res.status(400).json({ error: 'Missing table name.' });
        }

        // Validate the rating (ensure it's an integer and within range)
        if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
            // Update the rating in the specified table
            const { data, error } = await supabase
                .from(tableName) // Use dynamic tableName
                .update({ rating })
                .eq('token', token);

            if (error) {
                console.error('Error updating rating:', error);
                return res.status(400).json({ error: 'Error updating rating.' });
            }

            res.status(200).json({ message: 'Rating updated successfully!', rating });
        } else {
            // If rating is not a valid integer or not within the acceptable range
            return res.status(400).json({ error: 'Invalid rating. Please provide an integer between 1 and 5.' });
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({ error: 'Error setting rating.' });
    }
};

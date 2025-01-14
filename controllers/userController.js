import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabaseClient.js'; // Import Supabase client

// Register user and send game link
export const registerUser = async (req, res) => {
    const { name, email, phone } = req.body;

    try {
        // Remove +91 or 0 from the start of the phone number
        const cleanedPhone = phone.replace(/^(\+91|0)/, '');

        // Check if the user already exists in the database
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('phone', cleanedPhone)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            // Return error if it's not a "row not found" error
            console.error(fetchError.message);
            return res.status(500).json({ error: 'Error checking user existence.' });
        }

        if (existingUser) {
            // If the user exists, return their token and latest timestamp
            const latestPlayedTimestamp =
                existingUser.played_on?.length > 0
                    ? existingUser.played_on[existingUser.played_on.length - 1]
                    : null;
            return res.status(200).json({
                message: 'User already registered!',
                token: existingUser.token,
                latestPlayedTimestamp,
            });
        }

        // If the user doesn't exist, register them
        const token = uuidv4();

        // Insert user data into Supabase
        const { error } = await supabase
            .from('users')
            .insert([{ name, email, phone: cleanedPhone, token, game_played: false, played_on: [] }]);

        if (error) {
            console.error(error.message);
            return res.status(400).json({ error: error.message });
        }

        // Respond with the token
        res.status(200).json({ message: 'User registered successfully!', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error registering user.' });
    }
};

/**
 * Validate the token and check if the game has already been played.
 */
// export const validateToken = async (req, res) => {
//     const { token } = req.query;

//     try {
//         // Verify the token in the database
//         const { data, error } = await supabase.from('users').select('*').eq('token', token).single();
//         if (error || !data) return res.status(400).json({ error: 'Invalid or expired token.' });

//         // Check if the game has already been played
//         if (data.game_played) return res.status(400).json({ error: 'This game link has already been used.' });

//         // Redirect to the game page
//         res.redirect(`https://margros-games-client.vercel.app/home?token=${token}`);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Error validating token.' });
//     }
// };
export const markGamePlayed = async (req, res) => {
    const { token } = req.body;

    try {
        // Generate the current timestamp
        const playedOnTimestamp = new Date().toISOString();

        // Update the played_on timestamp column
        const { data, error } = await supabase
            .from('users')
            .update({
                game_played: true,
                played_on: playedOnTimestamp // Set the new timestamp value
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
 * Set the rating for the user.
 */
export const setRating = async (req, res) => {
    const { token, rating } = req.body; // Extract token and rating from request body

    try {
        // Validate the rating (ensure it's an integer and within range)
        if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
            // Update the rating in the Supabase database
            const { data, error } = await supabase
                .from('users')
                .update({ rating })
                .eq('token', token);

            if (error) {
                console.error(error.message);
                return res.status(400).json({ error: 'Error updating rating.' });
            }

            res.status(200).json({ message: 'Rating updated successfully!', rating });
        } else {
            // If rating is not a valid integer or not within the acceptable range
            return res.status(400).json({ error: 'Invalid rating. Please provide an integer between 1 and 5.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error setting rating.' });
    }
};

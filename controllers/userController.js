import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabaseClient.js'; // Import Supabase client
import sendSMS from '../config/smsClient.js'; // Import the sendSMS function

// Register user and send game link
export const registerUser = async (req, res) => {
    const { name, email, phone } = req.body;
    console.log(name)

    try {
        const token = uuidv4();

        // Insert user data into Supabase
        const { error } = await supabase.from('users').insert([{ name, email, phone, token, game_played: false }]);
        if (error){
            console.log(error.message)
             return res.status(400).json({ error: error.message });}

        // Generate game link
        const gameLink = `http://localhost:3001/api/validate-token?token=${token}`;

        // Send game link via SMS using Fast2SMS
        const message =
            `🎉 Play & Win! 🎉
Hi ${name},
Tap on the link and play exciting games to win amazing offers and menu! 🎁

👉 ${gameLink}

Hurry, don’t miss out! 🕒

         `;
        const sendStatus = await sendSMS(phone, message);

        if (sendStatus.error) {
            return res.status(500).json({ error: 'Failed to send SMS.' });
        }

        res.status(200).json({ message: 'Game link sent successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error registering user or sending SMS.' });
    }
};
/**
 * Validate the token and check if the game has already been played.
 */
export const validateToken = async (req, res) => {
    const { token } = req.query;

    try {
        // Verify the token in the database
        const { data, error } = await supabase.from('users').select('*').eq('token', token).single();
        if (error || !data) return res.status(400).json({ error: 'Invalid or expired token.' });

        // Check if the game has already been played
        if (data.game_played) return res.status(400).json({ error: 'This game link has already been used.' });

        // Redirect to the game page
        res.redirect(`http://localhost:3000/home?token=${token}`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error validating token.' });
    }
};

/**
 * Mark the game as played.
 */
export const markGamePlayed = async (req, res) => {
    const { token } = req.body;

    try {
        // Update the game_played status
        const { data, error } = await supabase.from('users').update({ game_played: true }).eq('token', token);
        if (error) return res.status(400).json({ error: error.message });

        res.status(200).json({ message: 'Game marked as played!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error marking game as played.' });
    }
};



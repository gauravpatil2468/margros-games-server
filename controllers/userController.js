import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabaseClient.js'; // Import Supabase client

// Register user and send game link
export const registerUser = async (req, res) => {
    const { name, email, phone } = req.body;

    try {
        // Check if the user already exists in the database
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('phone', phone)
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
            .insert([{ name, email, phone, token, game_played: false, played_on: [] }]);

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

/**
 * Mark the game as played and update the played_on timestamp.
 */
export const markGamePlayed = async (req, res) => {
    const { token } = req.body;

    try {
        // Update the game_played status and add current timestamp to played_on array
        const playedOnTimestamp = new Date().toISOString(); // Generate current timestamp
        const { data, error } = await supabase
            .from('users')
            .update({ game_played: true, played_on: supabase.raw('array_append(played_on, ?)', [playedOnTimestamp]) })
            .eq('token', token);

        if (error) return res.status(400).json({ error: error.message });

        res.status(200).json({ message: 'Game marked as played!', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error marking game as played.' });
    }
};

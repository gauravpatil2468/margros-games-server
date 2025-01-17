import express from 'express';
import { registerUser,  markGamePlayed, setRating } from '../controllers/userController.js';

const router = express.Router();

// POST /api/register - Register user and send game link
router.post('/register', registerUser);

// GET /api/validate-token - Validate token
// router.get('/validate-token', validateToken);

// POST /api/game-played - Mark game as played
router.post('/game-played', markGamePlayed);
router.post('/feedback',setRating)

export default router;

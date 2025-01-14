import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import userRoutes from './routes/userRoutes.js';

const app = express();

// Middleware for CORS
app.use(cors());

// Middleware for body parsing
app.use(bodyParser.json());

// Routes
app.use('/api', userRoutes);

// Use process.env.PORT provided by Render or fall back to 3001 if not available
const port = process.env.PORT || 3001;  // Render will provide this value

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

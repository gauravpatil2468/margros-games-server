import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import userRoutes from './routes/userRoutes.js';

const app = express();

// Middleware for CORS
app.use(cors());

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', userRoutes);

// Export app as a module for serverless use
export default app;


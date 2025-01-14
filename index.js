import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = 3001;

// Middleware for CORS
app.use(cors());

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', userRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

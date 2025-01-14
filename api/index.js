// Import the Express app from your existing index.js
import express from "express";
import app from '../index.js';  // Importing the app exported from index.js

// Export as a serverless function for Vercel
export default (req, res) => {
  app(req, res);  // Pass the request and response to the Express app
};

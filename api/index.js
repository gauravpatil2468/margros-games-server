// Import the Express app from your existing index.js
const express = require('express');
const app = require('../index');  // Assuming your Express app is in 'index.js'

// Export the Express app as a Vercel serverless function
module.exports = (req, res) => {
  app(req, res);
};

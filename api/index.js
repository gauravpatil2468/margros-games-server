import app from "../";  // Import the app from the root index.js

export default (req, res) => app(req, res);  // Wrap the app as a serverless function

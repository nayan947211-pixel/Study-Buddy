const serverless = require('serverless-http');
const app = require('../../server');

// Export the handler for Netlify Functions
exports.handler = serverless(app);

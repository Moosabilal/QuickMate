// src/config.ts or src/constants/api.ts

const config = {
  // Base URL for your backend API
  // Use a .env variable for production for better security and flexibility
  // For development, you can hardcode it or use a development .env file
  // For example: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'
  API_BASE_URL: 'http://localhost:5000/api',
};

export default config;
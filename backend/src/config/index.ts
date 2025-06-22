// src/config/index.ts
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

interface BackendConfig {
    PORT: number;
    MONGO_URI: string;
    JWT_SECRET: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
}

const config: BackendConfig = {
    PORT: parseInt(process.env.PORT || '5000', 10),
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/quickmate',
    JWT_SECRET: process.env.JWT_SECRET || 'jwt_secret_key', // ***CHANGE THIS IN PRODUCTION***
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};

export default config;
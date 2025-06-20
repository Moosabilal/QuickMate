import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import { rateLimiter } from './middleware/rateLimiter';
import connectDB from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//database
connectDB()

// Middleware
app.use(cors());
app.use(helmet()); // Security headers
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
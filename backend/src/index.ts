import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import { rateLimiter } from './middleware/rateLimiter';
import connectDB from './config/database';
import path from 'path';
import config from './config';
import categoryRoutes from './routes/categoryRoutes'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//database
connectDB()

// Middleware
app.use(cors());
app.use(helmet()); // Security headers
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(rateLimiter);

// Serve static files from 'uploads' directory (where Multer saves temporarily)
// IMPORTANT: In production, consider serving static files via Nginx/CDN or directly from Cloudinary
// app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes); // Category and Commission routes

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// import mongoose from 'mongoose';

// const connectDB = async (): Promise<void> => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI!);
//     console.log(`MongoDB connected `);
//   } catch (error) {
//     console.error('MongoDB connection error:', error);
//     process.exit(1); // Stop the app if DB fails to connect
//   }
// };

// export default connectDB;



// src/db/index.ts
import mongoose from 'mongoose';
import config from '../config'; // Import your config

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err: any) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;

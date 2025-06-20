import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!);
    console.log(`MongoDB connected `);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Stop the app if DB fails to connect
  }
};

export default connectDB;

// config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Log from '../utils/logger.js';

dotenv.config();

const uri = process.env.MONGODB_URI;

async function connectDB() {
  try {
    await mongoose.connect(uri);
    Log.success('Database: success connect.');
  } catch (error) {
    Log.error(`Database: error on connect: ${error.message}`);
    process.exit(1);
  }
}

export default connectDB;
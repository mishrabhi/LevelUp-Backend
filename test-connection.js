import dotenv from 'dotenv';
import connectDB from './config/database.js';

dotenv.config();

console.log('Testing database connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

connectDB()
  .then(() => {
    console.log('✅ Database connection successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  });

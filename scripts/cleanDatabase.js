import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const cleanDatabase = async () => {
  try {
    const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/levelup';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(dbUrl);
    
    console.log('🗑️  Dropping entire database...');
    await mongoose.connection.db.dropDatabase();
    
    console.log('✓ Database completely cleared!');
    console.log('');
    console.log('Now run: npm run seed');
    console.log('');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

cleanDatabase();

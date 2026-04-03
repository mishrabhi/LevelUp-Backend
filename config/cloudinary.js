import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Verify Cloudinary credentials are loaded
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

// Log configuration status (without exposing secrets)
console.log('Cloudinary Configuration:');
console.log('- Cloud Name:', cloudinaryConfig.cloud_name ? '✓ Set' : '✗ Missing');
console.log('- API Key:', cloudinaryConfig.api_key ? '✓ Set' : '✗ Missing');
console.log('- API Secret:', cloudinaryConfig.api_secret ? '✓ Set' : '✗ Missing');

if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
  console.warn('⚠️ WARNING: Cloudinary credentials are incomplete. Image uploads may fail.');
}

cloudinary.config(cloudinaryConfig);

export default cloudinary;

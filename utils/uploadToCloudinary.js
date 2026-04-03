import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

const uploadToCloudinary = async (fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) {
      const error = new Error('No file buffer provided');
      console.error('Upload error:', error);
      reject(error);
      return;
    }

    try {
      // Create a readable stream from the buffer
      const stream = Readable.from(fileBuffer);

      // Use upload_stream for better error handling
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'levelup/profiles',
          resource_type: 'auto',
          public_id: filename,
          overwrite: true,
          timeout: 30000,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error details:', {
              message: error.message,
              http_code: error.http_code,
              status: error.status,
            });
            reject(new Error(`Cloudinary error: ${error.message}`));
          } else {
            console.log('Upload successful:', result.public_id);
            resolve(result);
          }
        }
      );

      // Handle stream errors
      stream.on('error', (error) => {
        console.error('Stream error:', error.message);
        reject(new Error(`Stream error: ${error.message}`));
      });

      uploadStream.on('error', (error) => {
        console.error('Upload stream error:', error.message);
        reject(new Error(`Upload stream error: ${error.message}`));
      });

      // Pipe the stream to Cloudinary
      stream.pipe(uploadStream);

      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        stream.destroy();
        uploadStream.destroy();
        reject(new Error('Upload timeout'));
      }, 35000);

      uploadStream.on('close', () => {
        clearTimeout(timeout);
      });

    } catch (error) {
      console.error('Upload initialization error:', error);
      reject(new Error(`Upload failed: ${error.message}`));
    }
  });
};

export default uploadToCloudinary;

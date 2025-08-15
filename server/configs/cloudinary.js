import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

let isCloudinaryConfigured = false;

const connectCloudinary = async () => {
  try {
    // Check if all required environment variables are present
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.warn('⚠️ Cloudinary configuration skipped - missing environment variables');
      return false;
    }
  
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    isCloudinaryConfigured = true;
    console.log('☁️ Cloudinary Connected');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Cloudinary:', error.message);
    isCloudinaryConfigured = false;
    return false;
  }
};

// Helper function to check if Cloudinary is available
export const isCloudinaryAvailable = () => isCloudinaryConfigured;

// Helper function to safely upload to Cloudinary
export const safeCloudinaryUpload = async (filePath, options = {}) => {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured. Please check your environment variables.');
  }
  
  try {
    return await cloudinary.uploader.upload(filePath, options);
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error.message);
    throw error;
  }
};

export default connectCloudinary;

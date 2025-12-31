import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';
import fs from 'fs';

const configureCloudinary = () => {
  if (
    !process.env.CLOUD_NAME ||
    !process.env.CLOUD_API_KEY ||
    !process.env.CLOUD_API_SECRET
  ) {
    console.error(
      'Individual Cloudinary credentials not found in environment variables!'
    );
    throw new Error(
      'Cloudinary configuration failed: Missing CLOUD_NAME, API_KEY, or API_SECRET'
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true,
  });
};

const uploadOnCloudinary = async filePath => {
  try {
    if (!filePath) return null;
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
    });
    fs.unlinkSync(filePath);
    return response;
  } catch (error) {
    fs.unlinkSync(filePath);
    throw error;
  }
};
const deleteFromCloudinary = async publicId => {
  try {
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'auto',
    });
    return response;
  } catch (error) {
    return error;
  }
};
export { uploadOnCloudinary, deleteFromCloudinary, configureCloudinary };

export default cloudinary;

import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadOnCloudinary = async filePath => {
  try {
    if (!filePath) return null;
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
    });
    console.log(response.url);
    fs.unlinkSync(filePath);
    return response;
  } catch (error) {
    fs.unlinkSync(filePath);
    return error;
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
export { uploadOnCloudinary, deleteFromCloudinary };

export default cloudinary;

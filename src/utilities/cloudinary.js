import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const configureCloudinary = () => {
  const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;

  if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_API_SECRET) {
    throw new Error('Cloudinary configuration failed: Missing credentials');
  }

  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_API_SECRET,
    secure: true,
  });
};

const uploadOnCloudinary = async filePath => {
  try {
    if (!filePath) return null;
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
    });
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return response;
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw error;
  }
};

const deleteFromCloudinary = async publicId => {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: 'auto',
    });
  } catch (error) {
    return error;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary, configureCloudinary };
export default cloudinary;

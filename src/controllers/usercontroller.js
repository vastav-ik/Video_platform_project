import { asyncHandler } from '../utilities/asyncHandler.js';
import { ApiError } from '../utilities/APIError.js';
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from '../utilities/cloudinary.js';
import { ApiResponse } from '../utilities/APIResponse.js';
import { User } from '../models/user.models.js';

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;

  // Validation
  if (!username || !fullName || !email || !password) {
    throw new ApiError(400, 'All fields are required');
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existingUser) {
    throw new ApiError(409, 'User with given email or username already exists');
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar image is required');
  }

  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log('Avatar uploaded:', avatar.url);
  } catch (error) {
    console.log('Error uploading avatar', error);
    throw new ApiError(500, 'Failed to upload avatar image');
  }

  let coverImage = null;
  if (coverLocalPath) {
    try {
      coverImage = await uploadOnCloudinary(coverLocalPath);
      console.log('Cover image uploaded:', coverImage.url);
    } catch (error) {
      console.log('Error uploading cover image', error);
      throw new ApiError(500, 'Failed to upload cover image');
    }
  }

  try {
    // Logging data before creation
    console.log({
      username: username.toLowerCase(),
      fullName,
      email,
      avatarUrl: avatar.url,
      coverImageUrl: coverImage ? coverImage.url : 'no cover image',
    });

    const newUser = await User.create({
      username: username.toLowerCase(),
      fullName,
      email,
      password,
      avatar: avatar.url,
      coverImage: coverImage ? coverImage.url : undefined,
    });

    const createdUser = await User.findById(newUser._id).select(
      '-password -refreshToken'
    );
    if (!createdUser) {
      throw new ApiError(500, 'User registration failed');
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, 'User registered successfully'));
  } catch (error) {
    console.log('Error during user registration:', error);
    if (avatar?.public_id) {
      await deleteFromCloudinary(avatar.public_id);
    }
    if (coverImage?.public_id) {
      await deleteFromCloudinary(coverImage.public_id);
    }
    throw new ApiError(500, 'User registration failed and images were deleted');
  }
});

export { registerUser };

export default registerUser;

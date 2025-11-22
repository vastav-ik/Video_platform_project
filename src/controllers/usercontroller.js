import { asyncHandler } from '../utilities/asyncHandler.js';
import { ApiError } from '../utilities/APIError.js';
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from '../utilities/cloudinary.js';
import { ApiResponse } from '../utilities/APIResponse.js';
import { User } from '../models/user.models.js';
import jwt from 'jsonwebtoken';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshToken = async userId => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Token generation failed');
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, 'Email or Username is required');
  }
  if (!password) {
    throw new ApiError(400, 'Password is required');
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isPassValid = await user.isPassCorrect(password);
  if (!isPassValid) {
    throw new ApiError(401, 'Incorrect password');
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  return res
    .status(200)
    .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        'User logged In successfully'
      )
    );
});

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

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .clearCookie('accessToken', COOKIE_OPTIONS)
    .clearCookie('refreshToken', COOKIE_OPTIONS)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken ||
    req.header('Authorization')?.replace('Bearer ', '');

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized request: Refresh token is missing');
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token: User not found');
    }
    if (incomingRefreshToken !== user.refreshToken) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
      throw new ApiError(401, 'Refresh token expired or used: Login required');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const refreshedUser = await User.findById(user._id).select(
      '-password -refreshToken'
    );

    return res
      .status(200)
      .cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS)
      .json(
        new ApiResponse(
          200,
          {
            user: refreshedUser,
            accessToken,
            refreshToken: newRefreshToken,
          },
          'Access token refreshed successfully'
        )
      );
  } catch (error) {
    res
      .clearCookie('accessToken', COOKIE_OPTIONS)
      .clearCookie('refreshToken', COOKIE_OPTIONS);

    throw new ApiError(
      401,
      error?.message || 'Invalid refresh token or session expired'
    );
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  generateAccessAndRefreshToken,
  refreshAccessToken,
};

export default registerUser;

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
      avatar: {
        url: avatar.url,
        publicId: avatar.public_id,
      },
      coverImage: coverImage
        ? {
            url: coverImage.url,
            publicId: coverImage.public_id,
          }
        : undefined,
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

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'Current user fetched successfully'));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { fullName, email, bio } = req.body;
  const user = req.user;

  if (!fullName && !email && !bio) {
    throw new ApiError(
      400,
      'At least one field (fullName, email, or bio) is required to update'
    );
  }

  const updateFields = {};
  if (fullName) updateFields.fullName = fullName;
  if (bio) updateFields.bio = bio;

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      throw new ApiError(409, 'User with this email already exists');
    }
    updateFields.email = email;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updateFields },
      { new: true } // Return the updated document
    ).select('-password -refreshToken');

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedUser,
          'Account details updated successfully'
        )
      );
  }
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const user = req.user;
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is missing');
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar || !avatar.url) {
    throw new ApiError(500, 'Error uploading avatar to cloudinary');
  }

  if (user.avatar && user.avatar.publicId) {
    await deleteFromCloudinary(user.avatar.publicId);
  } else if (user.avatar && typeof user.avatar === 'string') {
    // fallback
    const publicId = user.avatar.split('/').pop().split('.')[0];
    await deleteFromCloudinary(publicId);
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        avatar: {
          url: avatar.url,
          publicId: avatar.public_id,
        },
      },
    },
    { new: true }
  ).select('-password -refreshToken');

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, 'Avatar updated successfully'));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const user = req.user;
  const coverLocalPath = req.file?.path;

  if (!coverLocalPath) {
    throw new ApiError(400, 'Cover image file is missing');
  }

  const coverImage = await uploadOnCloudinary(coverLocalPath);
  if (!coverImage || !coverImage.url) {
    throw new ApiError(500, 'Error uploading cover image to cloudinary');
  }

  if (user.coverImage && user.coverImage.publicId) {
    await deleteFromCloudinary(user.coverImage.publicId);
  } else if (user.coverImage && typeof user.coverImage === 'string') {
    // fallback
    const publicId = user.coverImage.split('/').pop().split('.')[0];
    await deleteFromCloudinary(publicId);
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        coverImage: {
          url: coverImage.url,
          publicId: coverImage.public_id,
        },
      },
    },
    { new: true }
  ).select('-password -refreshToken');

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, 'Cover image updated successfully')
    );
});

const updateUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (!oldPassword || !newPassword) {
    throw new ApiError(
      400,
      'All fields (oldPassword and newPassword) are required'
    );
  }
  if (oldPassword === newPassword) {
    throw new ApiError(400, 'New password cannot be the same as old password');
  }
  const isPasswordCorrect = await user.isPassCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid old password');
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password updated successfully'));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  generateAccessAndRefreshToken,
  refreshAccessToken,
  getCurrentUser,
  updateUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
  updateUserPassword,
};

export default registerUser;

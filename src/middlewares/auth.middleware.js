import { asyncHandler } from '../utilities/asyncHandler.js';
import { ApiError } from '../utilities/APIError.js';
import { User } from '../models/user.models.js';
import jwt from 'jsonwebtoken';

const verifyJWT = asyncHandler(async (req, resizeBy, next) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Unautorised Request');
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      '-password -refreshToken'
    );
    if (!user) {
      throw new ApiError(401, 'Invalid Access Token: User not found');
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid access token');
  }
});

export { verifyJWT };

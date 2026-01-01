import mongoose, { isValidObjectId } from 'mongoose';
import { Like } from '../models/likes.models.js';
import { Video } from '../models/video.models.js';
import { Comment } from '../models/comment.models.js';
import { Card } from '../models/card.models.js';
import { ApiError } from '../utilities/APIError.js';
import { ApiResponse } from '../utilities/APIResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { type = 'like' } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid Video ID');
  }

  const existingResponse = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (existingResponse) {
    if (existingResponse.type === type) {
      await Like.findByIdAndDelete(existingResponse._id);
      const incField = type === 'like' ? 'likesCount' : 'dislikesCount';
      await Video.findByIdAndUpdate(videoId, { $inc: { [incField]: -1 } });
      return res
        .status(200)
        .json(new ApiResponse(200, { type: null }, 'Removed successfully'));
    } else {
      const oldType = existingResponse.type;
      existingResponse.type = type;
      await existingResponse.save();

      const incUpdate = {};
      incUpdate[type === 'like' ? 'likesCount' : 'dislikesCount'] = 1;
      incUpdate[oldType === 'like' ? 'likesCount' : 'dislikesCount'] = -1;

      await Video.findByIdAndUpdate(videoId, { $inc: incUpdate });
      return res
        .status(200)
        .json(new ApiResponse(200, { type }, `Switched to ${type}`));
    }
  }

  await Like.create({
    video: videoId,
    likedBy: req.user?._id,
    type,
  });

  const incField = type === 'like' ? 'likesCount' : 'dislikesCount';
  await Video.findByIdAndUpdate(videoId, { $inc: { [incField]: 1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, { type }, `${type} added successfully`));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { type = 'like' } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, 'Invalid Comment ID');
  }

  const existingResponse = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (existingResponse) {
    if (existingResponse.type === type) {
      await Like.findByIdAndDelete(existingResponse._id);
      const incField = type === 'like' ? 'likesCount' : 'dislikesCount';
      await Comment.findByIdAndUpdate(commentId, { $inc: { [incField]: -1 } });
      return res
        .status(200)
        .json(new ApiResponse(200, { type: null }, 'Removed successfully'));
    } else {
      const oldType = existingResponse.type;
      existingResponse.type = type;
      await existingResponse.save();

      const incUpdate = {};
      incUpdate[type === 'like' ? 'likesCount' : 'dislikesCount'] = 1;
      incUpdate[oldType === 'like' ? 'likesCount' : 'dislikesCount'] = -1;

      await Comment.findByIdAndUpdate(commentId, { $inc: incUpdate });
      return res
        .status(200)
        .json(new ApiResponse(200, { type }, `Switched to ${type}`));
    }
  }

  await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
    type,
  });

  const incField = type === 'like' ? 'likesCount' : 'dislikesCount';
  await Comment.findByIdAndUpdate(commentId, { $inc: { [incField]: 1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, { type }, `${type} added successfully`));
});

const toggleCardLike = asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  const { type = 'like' } = req.body;

  if (!isValidObjectId(cardId)) {
    throw new ApiError(400, 'Invalid Card ID');
  }

  const existingResponse = await Like.findOne({
    card: cardId,
    likedBy: req.user?._id,
  });

  if (existingResponse) {
    if (existingResponse.type === type) {
      await Like.findByIdAndDelete(existingResponse._id);
      const incField = type === 'like' ? 'likesCount' : 'dislikesCount';
      await Card.findByIdAndUpdate(cardId, { $inc: { [incField]: -1 } });
      return res
        .status(200)
        .json(new ApiResponse(200, { type: null }, 'Removed successfully'));
    } else {
      const oldType = existingResponse.type;
      existingResponse.type = type;
      await existingResponse.save();

      const incUpdate = {};
      incUpdate[type === 'like' ? 'likesCount' : 'dislikesCount'] = 1;
      incUpdate[oldType === 'like' ? 'likesCount' : 'dislikesCount'] = -1;

      await Card.findByIdAndUpdate(cardId, { $inc: incUpdate });
      return res
        .status(200)
        .json(new ApiResponse(200, { type }, `Switched to ${type}`));
    }
  }

  await Like.create({
    card: cardId,
    likedBy: req.user?._id,
    type,
  });

  const incField = type === 'like' ? 'likesCount' : 'dislikesCount';
  await Card.findByIdAndUpdate(cardId, { $inc: { [incField]: 1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, { type }, `${type} added successfully`));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
        video: { $exists: true },
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'video',
        foreignField: '_id',
        as: 'video',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
              pipeline: [
                {
                  $project: {
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: '$owner' },
            },
          },
        ],
      },
    },
    {
      $unwind: '$video',
    },
    {
      $project: {
        video: 1,
        createdAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, 'Liked videos fetched successfully')
    );
});

export { toggleVideoLike, toggleCommentLike, toggleCardLike, getLikedVideos };

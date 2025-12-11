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

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid Video ID');
  }

  const likedAlready = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);
    await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: -1 } });
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false }, 'Unliked successfully'));
  }

  await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });
  await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: 1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true }, 'Liked successfully'));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, 'Invalid Comment ID');
  }

  const likedAlready = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);
    await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: -1 } });
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false }, 'Unliked successfully'));
  }

  await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });
  await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: 1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true }, 'Liked successfully'));
});

const toggleCardLike = asyncHandler(async (req, res) => {
  const { cardId } = req.params;

  if (!isValidObjectId(cardId)) {
    throw new ApiError(400, 'Invalid Card ID');
  }

  const likedAlready = await Like.findOne({
    card: cardId,
    likedBy: req.user?._id,
  });

  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);
    await Card.findByIdAndUpdate(cardId, { $inc: { likesCount: -1 } });
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false }, 'Unliked successfully'));
  }

  await Like.create({
    card: cardId,
    likedBy: req.user?._id,
  });
  await Card.findByIdAndUpdate(cardId, { $inc: { likesCount: 1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true }, 'Liked successfully'));
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

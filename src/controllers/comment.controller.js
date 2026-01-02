import mongoose, { isValidObjectId } from 'mongoose';
import { Comment } from '../models/comment.models.js';
import { Video } from '../models/video.models.js';
import { Card } from '../models/card.models.js';
import { ApiError } from '../utilities/APIError.js';
import { ApiResponse } from '../utilities/APIResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid Video ID');
  }

  const commentAggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
        parentComment: null,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
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
    {
      $sort: { createdAt: -1 },
    },
  ]);

  const comments = await Comment.aggregatePaginate(commentAggregate, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comments, 'Comments fetched successfully'));
});

const getCardComments = asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(cardId)) {
    throw new ApiError(400, 'Invalid Card ID');
  }

  const commentAggregate = Comment.aggregate([
    {
      $match: {
        card: new mongoose.Types.ObjectId(cardId),
        parentComment: null,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
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
    {
      $sort: { createdAt: -1 },
    },
  ]);

  const comments = await Comment.aggregatePaginate(commentAggregate, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comments, 'Comments fetched successfully'));
});

const addVideoComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content, parentCommentId } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid Video ID');
  }
  if (!content) {
    throw new ApiError(400, 'Content is required');
  }

  if (parentCommentId && !isValidObjectId(parentCommentId)) {
    throw new ApiError(400, 'Invalid Parent Comment ID');
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    author: req.user?._id,
    parentComment: parentCommentId || null,
  });

  if (!comment) {
    throw new ApiError(500, 'Failed to add comment');
  }

  await Video.findByIdAndUpdate(videoId, { $inc: { commentsCount: 1 } });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, 'Comment added successfully'));
});

const addCardComment = asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  const { content, parentCommentId } = req.body;

  if (!isValidObjectId(cardId)) {
    throw new ApiError(400, 'Invalid Card ID');
  }
  if (!content) {
    throw new ApiError(400, 'Content is required');
  }

  if (parentCommentId && !isValidObjectId(parentCommentId)) {
    throw new ApiError(400, 'Invalid Parent Comment ID');
  }

  const card = await Card.findById(cardId);
  if (!card) {
    throw new ApiError(404, 'Card not found');
  }

  const comment = await Comment.create({
    content,
    card: cardId,
    author: req.user?._id,
    parentComment: parentCommentId || null,
  });

  if (!comment) {
    throw new ApiError(500, 'Failed to add comment');
  }

  await Card.findByIdAndUpdate(cardId, { $inc: { commentsCount: 1 } });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, 'Comment added successfully'));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, 'Invalid Comment ID');
  }
  if (!content) {
    throw new ApiError(400, 'Content is required');
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  if (comment.author.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this comment');
  }

  comment.content = content;
  await comment.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, 'Comment updated successfully'));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, 'Invalid Comment ID');
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  if (comment.author.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this comment');
  }

  if (comment.video) {
    await Video.findByIdAndUpdate(comment.video, {
      $inc: { commentsCount: -1 },
    });
  } else if (comment.card) {
    await Card.findByIdAndUpdate(comment.card, { $inc: { commentsCount: -1 } });
  }

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Comment deleted successfully'));
});

export {
  getVideoComments,
  getCardComments,
  addVideoComment,
  addCardComment,
  updateComment,
  deleteComment,
};

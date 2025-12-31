import { Card } from '../models/card.models.js';
import { ApiError } from '../utilities/APIError.js';
import { ApiResponse } from '../utilities/APIResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from '../utilities/cloudinary.js';
import mongoose, { isValidObjectId } from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const createCard = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, 'Content is required');
  }

  const imageLocalPath = req.files?.image?.[0]?.path;
  const videoLocalPath = req.files?.video?.[0]?.path;

  let imageUrl = '';
  let videoUrl = '';

  if (imageLocalPath) {
    const image = await uploadOnCloudinary(imageLocalPath);
    if (image) imageUrl = image.url;
  }

  if (videoLocalPath) {
    const video = await uploadOnCloudinary(videoLocalPath);
    if (video) videoUrl = video.url;
  }

  const card = await Card.create({
    content,
    image: imageUrl,
    video: videoUrl,
    author: req.user?._id,
  });

  if (!card) {
    throw new ApiError(500, 'Failed to create card');
  }

  return res
    .status(201)
    .json(new ApiResponse(201, card, 'Card created successfully'));
});

const getUserCards = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid User ID');
  }

  const cardAggregate = Card.aggregate([
    {
      $match: {
        author: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
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
        author: { $first: '$author' },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  Card.aggregatePaginate(cardAggregate, { page, limit })
    .then(result => {
      return res
        .status(200)
        .json(new ApiResponse(200, result, 'User cards fetched successfully'));
    })
    .catch(err => {
      throw new ApiError(500, 'Failed to fetch cards');
    });
});

const getCardById = asyncHandler(async (req, res) => {
  const { cardId } = req.params;

  if (!isValidObjectId(cardId)) {
    throw new ApiError(400, 'Invalid Card ID');
  }

  const card = await Card.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(cardId) },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
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
        author: { $first: '$author' },
      },
    },
  ]);

  if (!card?.length) {
    throw new ApiError(404, 'Card not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, card[0], 'Card fetched successfully'));
});

const updateCard = asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(cardId)) {
    throw new ApiError(400, 'Invalid Card ID');
  }

  const card = await Card.findById(cardId);
  if (!card) {
    throw new ApiError(404, 'Card not found');
  }

  if (card.author.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this card');
  }

  if (content) card.content = content;

  await card.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, card, 'Card updated successfully'));
});

const deleteCard = asyncHandler(async (req, res) => {
  const { cardId } = req.params;

  if (!isValidObjectId(cardId)) {
    throw new ApiError(400, 'Invalid Card ID');
  }

  const card = await Card.findById(cardId);
  if (!card) {
    throw new ApiError(404, 'Card not found');
  }

  if (card.author.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this card');
  }

  if (card.image) {
    const publicId = card.image.split('/').pop().split('.')[0];
    await deleteFromCloudinary(publicId);
  }

  if (card.video) {
    const publicId = card.video.split('/').pop().split('.')[0];
    await deleteFromCloudinary(publicId, 'video');
  }

  await Card.findByIdAndDelete(cardId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Card deleted successfully'));
});

const getAllCards = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const cardAggregate = Card.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
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
        author: { $first: '$author' },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  Card.aggregatePaginate(cardAggregate, { page, limit })
    .then(result => {
      return res
        .status(200)
        .json(new ApiResponse(200, result, 'All cards fetched successfully'));
    })
    .catch(err => {
      throw new ApiError(500, 'Failed to fetch cards');
    });
});

export {
  createCard,
  getUserCards,
  getCardById,
  updateCard,
  deleteCard,
  getAllCards,
};

import mongoose, { isValidObjectId } from 'mongoose';
import { Video } from '../models/video.models.js';
import { User } from '../models/user.models.js';
import { ApiError } from '../utilities/APIError.js';
import { ApiResponse } from '../utilities/APIResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { uploadOnCloudinary } from '../utilities/cloudinary.js';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const pipelineyb = [];

  if (query) {
    pipelineyb.push({
      $match: {
        $text: { $search: query },
      },
    });
  }
  if (userId) {
    if (!isValidObjectId(userId)) throw new ApiError(400, 'Invalid User Id');
    pipelineyb.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }
  pipelineyb.push({ $match: { isPublished: true } });

  if (sortBy && sortType) {
    pipelineyb.push({
      $sort: {
        [sortBy]: sortType === 'asc' ? 1 : -1,
      },
    });
  } else {
    pipelineyb.push({ $sort: { createdAt: -1 } });
  }
  pipelineyb.push({
    $lookup: {
      from: 'users',
      localField: 'owner',
      foreignField: '_id',
      as: 'ownerDetails',
      pipeline: [{ $project: { username: 1, avatar: 1 } }],
    },
  });
  pipelineyb.push({ $unwind: '$ownerDetails' });
  mongoose.plugin(aggregatePaginate);
  const videoAggregate = Video.aggregate(pipelineyb);
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const video = await Video.aggregatePaginate(videoAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, video, 'Videos fetched successfully'));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if ([title, description].some(field => field.trim() === '')) {
    throw new ApiError(400, 'Title and Description are required');
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, 'Video file is required');
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, 'Thumbnail file is required');
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile) throw new ApiError(500, 'Video file upload failed');
  if (!thumbnail) throw new ApiError(500, 'Thumbnail upload failed');

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration,
    owner: req.user._id,
    isPublished: true,
  });

  const createdVideo = await Video.findById(video._id);
  if (!createdVideo)
    throw new ApiError(500, 'Video upload failed please try again');

  return res
    .status(201)
    .json(new ApiResponse(200, createdVideo, 'Video published successfully'));
});

const getVideoById = asyncHandler(async (req, res) => {
  const videoId = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid Video ID');
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
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
              subscribersCount: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'video',
        as: 'likes',
      },
    },
    {
      $addFields: {
        owner: { $first: '$owner' },
        likesCount: { $size: '$likes' },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, '$likes.likedBy'] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        likes: 0,
      },
    },
  ]);
});
 
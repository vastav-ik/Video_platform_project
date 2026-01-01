import mongoose, { isValidObjectId } from 'mongoose';
import { Video } from '../models/video.models.js';
import { User } from '../models/user.models.js';
import { Subscription } from '../models/subscription.models.js';
import { ApiError } from '../utilities/APIError.js';
import { ApiResponse } from '../utilities/APIResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from '../utilities/cloudinary.js';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const pipeline = [];

  if (query) {
    pipeline.push({
      $match: {
        $text: {
          $search: query,
        },
      },
    });
  }

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, 'Invalid User ID');
    }
    const isOwner = req.user?._id?.toString() === userId.toString();
    const matchStage = {
      owner: new mongoose.Types.ObjectId(userId),
    };

    if (!isOwner) {
      matchStage.status = 'public';
    }

    pipeline.push({ $match: matchStage });
  } else {
    pipeline.push({ $match: { status: 'public' } });
  }

  if (sortBy && sortType) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType === 'asc' ? 1 : -1,
      },
    });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'owner',
      foreignField: '_id',
      as: 'owner',
    },
  });

  pipeline.push({
    $addFields: {
      owner: {
        $first: '$owner',
      },
    },
  });
  const videoAggregate = Video.aggregate(pipeline);
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

  const videoFileResponse = await uploadOnCloudinary(videoLocalPath);
  const thumbnailResponse = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFileResponse) throw new ApiError(500, 'Video file upload failed');
  if (!thumbnailResponse) throw new ApiError(500, 'Thumbnail upload failed');

  const video = await Video.create({
    title,
    description,
    videoFile: {
      url: videoFileResponse.url,
      publicId: videoFileResponse.public_id,
    },
    thumbnail: {
      url: thumbnailResponse.url,
      publicId: thumbnailResponse.public_id,
    },
    duration: videoFileResponse.duration,
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
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid Video ID');
  }

  console.log(`Fetching video: ${videoId}`);
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
        from: 'subscriptions',
        localField: 'owner._id',
        foreignField: 'subscribedTo',
        as: 'isSubscribed',
        pipeline: [
          {
            $match: {
              subscriber: req.user?._id
                ? new mongoose.Types.ObjectId(req.user._id)
                : null,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $first: '$owner' },
        isSubscribed: {
          $cond: {
            if: { $gt: [{ $size: '$isSubscribed' }, 0] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'video',
        as: 'isLiked',
        pipeline: [
          {
            $match: {
              likedBy: req.user?._id
                ? new mongoose.Types.ObjectId(req.user._id)
                : null,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        isLiked: {
          $cond: {
            if: { $gt: [{ $size: '$isLiked' }, 0] },
            then: true,
            else: false,
          },
        },
      },
    },
  ]);

  if (!video?.length) {
    console.log('Video not found in aggregation');
    throw new ApiError(404, 'Video not found');
  }

  const videoData = video[0];
  console.log(`Video status: ${videoData.status}`);
  console.log(`User: ${req.user?._id}`);

  if (
    videoData.status === 'private' &&
    videoData.owner._id.toString() !== req.user?._id?.toString()
  ) {
    console.log('Privacy Restricted');
    throw new ApiError(403, 'This video is private.');
  }

  if (videoData.status === 'members-only') {
    if (!req.user) {
      console.log('Members-only: No user');
      throw new ApiError(403, 'Login required to access members-only content');
    }

    if (videoData.owner._id.toString() !== req.user._id.toString()) {
      const subscription = await Subscription.findOne({
        subscriber: req.user._id,
        subscribedTo: videoData.owner._id,
        isMember: true,
      });

      if (!subscription) {
        console.log('Members-only: Not a member');
        throw new ApiError(
          403,
          'This video is for members only. Join the channel to watch.'
        );
      }
    }
  }

  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        watchHistory: videoId,
      },
    });
  }

  await Video.findByIdAndUpdate(videoId, {
    $inc: { views: 1 },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], 'Video fetched successfully'));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid Video ID');
  }

  if (!title && !description) {
    throw new ApiError(400, 'Title or Description is required');
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this video');
  }

  const thumbnailLocalPath = req.file?.path;

  if (thumbnailLocalPath) {
    const thumbnailResponse = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnailResponse) {
      throw new ApiError(500, 'Thumbnail upload failed');
    }

    if (video.thumbnail && video.thumbnail.publicId) {
      await deleteFromCloudinary(video.thumbnail.publicId);
    } else if (typeof video.thumbnail === 'string') {
      const publicId = video.thumbnail.split('/').pop().split('.')[0];
      await deleteFromCloudinary(publicId);
    }

    video.thumbnail = {
      url: thumbnailResponse.url,
      publicId: thumbnailResponse.public_id,
    };
  }

  if (title) video.title = title;
  if (description) video.description = description;

  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, 'Video updated successfully'));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid Video ID');
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this video');
  }

  if (video.videoFile) {
    if (video.videoFile.publicId) {
      await deleteFromCloudinary(video.videoFile.publicId, 'video');
    } else if (typeof video.videoFile === 'string') {
      const publicId = video.videoFile.split('/').pop().split('.')[0];
      await deleteFromCloudinary(publicId, 'video');
    }
  }

  if (video.thumbnail) {
    if (video.thumbnail.publicId) {
      await deleteFromCloudinary(video.thumbnail.publicId);
    } else if (typeof video.thumbnail === 'string') {
      const publicId = video.thumbnail.split('/').pop().split('.')[0];
      await deleteFromCloudinary(publicId);
    }
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Video deleted successfully'));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid Video ID');
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, 'You are not authorized to perform this action');
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, video.isPublished, 'Video publish status toggled')
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

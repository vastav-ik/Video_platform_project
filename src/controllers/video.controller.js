import mongoose, { isValidObjectId } from 'mongoose';
import { Video } from '../models/video.models.js';
import { User } from '../models/user.models.js';
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
      $addFields: {
        owner: { $first: '$owner' },
        isLiked: {
          $cond: {
            // We still need to check if *current user* liked it, so we need a check.
            // But we don't need to count ALL likes.
            // Wait, how do we check if *current user* liked it without lookup?
            // We can do a lookup with pipeline that matches ONLY current user.
            // That is much cheaper than looking up ALL likes.
            // But wait, the previous code lookup entire 'likes' array?
            // "from: 'likes', localField: '_id', foreignField: 'video', as: 'likes'"
            // Yes, that pulls ALL likes for the video. If a video has 1M likes, that's bad.
            //
            // Optimization: lookup ONLY where 'likedBy' == req.user._id
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
              likedBy: new mongoose.Types.ObjectId(req.user?._id),
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
    throw new ApiError(404, 'Video not found');
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

  // Delete assets from Cloudinary
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

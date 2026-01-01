import mongoose, { isValidObjectId } from 'mongoose';
import { Playlist } from '../models/playlist.models.js';
import { Video } from '../models/video.models.js';
import { ApiError } from '../utilities/APIError.js';
import { ApiResponse } from '../utilities/APIResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, isPrivate } = req.body;

  if (!name || name.trim() === '') {
    throw new ApiError(400, 'Name is required');
  }

  const playlist = await Playlist.create({
    name,
    description,
    isPrivate: isPrivate || false,
    owner: req.user?._id,
  });

  if (!playlist) {
    throw new ApiError(500, 'Failed to create playlist');
  }

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, 'Playlist created successfully'));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid User ID');
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        $or: [
          { isPrivate: false },
          { owner: new mongoose.Types.ObjectId(req.user?._id) },
        ],
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'videos',
        foreignField: '_id',
        as: 'videos',
        pipeline: [
          {
            $project: {
              thumbnail: 1,
            },
          },
          { $limit: 1 },
        ],
      },
    },
    {
      $addFields: {
        playlistThumbnail: {
          $cond: {
            if: { $gt: [{ $size: '$videos' }, 0] },
            then: { $first: '$videos' },
            else: null,
          },
        },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, 'User playlists fetched successfully')
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, 'Invalid Playlist ID');
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
        $or: [
          { isPrivate: false },
          { owner: new mongoose.Types.ObjectId(req.user?._id) },
        ],
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'videos',
        foreignField: '_id',
        as: 'videos',
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
  ]);

  if (!playlist?.length) {
    throw new ApiError(404, 'Playlist not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist[0], 'Playlist fetched successfully'));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid Playlist or Video ID');
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, 'Playlist not found');
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, 'You are not authorized to modify this playlist');
  }

  if (playlist.videos.includes(videoId)) {
    return res
      .status(200)
      .json(new ApiResponse(200, playlist, 'Video already in playlist'));
  }

  playlist.videos.push(videoId);
  await playlist.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, 'Video added to playlist successfully')
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid Playlist or Video ID');
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, 'Playlist not found');
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, 'You are not authorized to modify this playlist');
  }

  playlist.videos = playlist.videos.filter(
    id => id.toString() !== videoId.toString()
  );

  await playlist.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, 'Video removed from playlist successfully')
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, 'Invalid Playlist ID');
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, 'Playlist not found');
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this playlist');
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Playlist deleted successfully'));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, 'Invalid Playlist ID');
  }
  if (!name && !description) {
    throw new ApiError(400, 'Name or Description is required');
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, 'Playlist not found');
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this playlist');
  }

  if (name) playlist.name = name;
  if (description) playlist.description = description;

  await playlist.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Playlist updated successfully'));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};

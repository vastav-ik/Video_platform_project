import mongoose, { isValidObjectId } from 'mongoose';
import { User } from '../models/user.models.js';
import { Subscription } from '../models/subscription.models.js';
import { ApiError } from '../utilities/APIError.js';
import { ApiResponse } from '../utilities/APIResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, 'Invalid Channel ID');
  }

  if (channelId.toString() === req.user?._id.toString()) {
    throw new ApiError(400, 'You cannot subscribe to yourself');
  }

  const isSubscribed = await Subscription.findOne({
    subscriber: req.user?._id,
    subscribedTo: channelId,
  });

  if (isSubscribed) {
    await Subscription.findByIdAndDelete(isSubscribed?._id);

    await User.findByIdAndUpdate(channelId, { $inc: { subscribersCount: -1 } });
    await User.findByIdAndUpdate(req.user?._id, {
      $inc: { subscribedToCount: -1 },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isSubscribed: false },
          'Unsubscribed successfully'
        )
      );
  }

  await Subscription.create({
    subscriber: req.user?._id,
    subscribedTo: channelId,
  });

  await User.findByIdAndUpdate(channelId, { $inc: { subscribersCount: 1 } });
  await User.findByIdAndUpdate(req.user?._id, {
    $inc: { subscribedToCount: 1 },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { isSubscribed: true }, 'Subscribed successfully')
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  let { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, 'Invalid Channel/Subscriber ID');
  }

  const channelId = subscriberId;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, 'Invalid Channel ID');
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        subscribedTo: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'subscriber',
        foreignField: '_id',
        as: 'subscriber',
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriber: { $first: '$subscriber' },
      },
    },
    {
      $project: {
        subscriber: 1,
        createdAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, 'Subscribers fetched successfully')
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  let { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, 'Invalid Subscriber ID');
  }

  const subscriberId = channelId;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, 'Invalid Subscriber ID');
  }

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'subscribedTo',
        foreignField: '_id',
        as: 'subscribedTo',
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscribedTo: { $first: '$subscribedTo' },
      },
    },
    {
      $project: {
        subscribedTo: 1,
        createdAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        'Subscribed channels fetched successfully'
      )
    );
});

const toggleMembership = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, 'Invalid Channel ID');
  }

  if (channelId.toString() === req.user?._id.toString()) {
    throw new ApiError(400, 'You cannot join your own channel');
  }

  const subscription = await Subscription.findOne({
    subscriber: req.user?._id,
    subscribedTo: channelId,
  });

  if (subscription) {
    subscription.isMember = !subscription.isMember;
    await subscription.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isMember: subscription.isMember },
          subscription.isMember
            ? 'Membership activated successfully'
            : 'Membership deactivated successfully'
        )
      );
  } else {
    await Subscription.create({
      subscriber: req.user?._id,
      subscribedTo: channelId,
      isMember: true,
    });

    await User.findByIdAndUpdate(channelId, { $inc: { subscribersCount: 1 } });
    await User.findByIdAndUpdate(req.user?._id, {
      $inc: { subscribedToCount: 1 },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isMember: true },
          'Membership activated successfully'
        )
      );
  }
});

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
  toggleMembership,
};

import { Schema } from 'mongoose';
import mongoose from 'mongoose';

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscribedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model('Subscription', subscriptionSchema);

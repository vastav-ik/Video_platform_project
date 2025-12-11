import { Schema } from 'mongoose';
import mongoose from 'mongoose';

const likesSchema = new Schema(
  {
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
    card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  },
  { timestamps: true }
);

export const Like = mongoose.model('Like', likesSchema);

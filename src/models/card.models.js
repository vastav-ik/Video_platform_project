import { Schema } from 'mongoose';
import mongoose from 'mongoose';
const cardSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: { type: String, maxlength: 500 },
    image: {
      url: String,
      publicId: String,
    },
    video: {
      url: String,
      publicId: String,
    },

    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    index: { type: Number },
  },
  { timestamps: true }
);

export const Card = mongoose.model('Card', cardSchema);

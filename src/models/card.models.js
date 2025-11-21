import { Schema } from 'mongoose';
import mongoose from 'mongoose';
const cardSchema = new schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: { type: String, maxlength: 500 },
    image: { type: String }, // optional media
    video: { type: String }, // optional media

    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    index: { type: Number },
  },
  { timestamps: true }
);

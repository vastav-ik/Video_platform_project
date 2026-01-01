import { Schema } from 'mongoose';
import mongoose from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

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

    originalCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      default: null,
    },
    type: {
      type: String,
      enum: ['post', 'repost', 'reply', 'quote'],
      default: 'post',
    },
    hashtags: [String],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    index: { type: Number },
  },
  { timestamps: true }
);

cardSchema.plugin(aggregatePaginate);

export const Card = mongoose.model('Card', cardSchema);

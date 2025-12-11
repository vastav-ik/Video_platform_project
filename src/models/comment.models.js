import { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoose from 'mongoose';

const commentSchema = new Schema(
  {
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
    card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },

    likesCount: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model('Comment', commentSchema);

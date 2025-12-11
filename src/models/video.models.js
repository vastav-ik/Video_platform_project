import { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoose from 'mongoose';

const videoSchema = new Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    videoFile: { type: String, required: true },
    thumbnail: { type: String },

    duration: { type: Number },
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },

    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    index: { type: Number, default: 0 },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model('Video', videoSchema);

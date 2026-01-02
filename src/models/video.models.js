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
    videoFile: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    thumbnail: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },

    duration: { type: Number },
    views: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['public', 'private', 'unlisted', 'members-only'],
      default: 'public',
    },
    transcodedFiles: [
      {
        quality: String,
        url: String,
      },
    ],
    tags: [String],
    category: { type: String },
    allowComments: { type: Boolean, default: true },

    likesCount: { type: Number, default: 0 },
    dislikesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    index: { type: Number, default: 0 },
  },
  { timestamps: true }
);

videoSchema.index({ title: 'text', description: 'text' });

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model('Video', videoSchema);

import { Schema } from 'mongoose';

const playlistSchema = new Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],

    isPrivate: { type: Boolean, default: false },
  },

  { timestamps: true }
);

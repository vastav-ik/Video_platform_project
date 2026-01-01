import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Video } from '../models/video.models.js';
import { DB_NAME } from '../constants.js';

dotenv.config({
  path: './.env',
});

const migrateVideos = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log('Connected to DB');

    const result = await Video.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'public' } }
    );

    console.log(`Updated ${result.modifiedCount} videos to public status.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateVideos();

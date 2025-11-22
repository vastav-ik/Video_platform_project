import { app } from './app.js';
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { configureCloudinary } from './utilities/cloudinary.js';

dotenv.config({
  path: './.env',
});

const PORT = process.env.PORT || 8000;

try {
  configureCloudinary();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log('MongoDB connection error2', err);
  });

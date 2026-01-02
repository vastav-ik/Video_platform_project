import 'dotenv/config';
import { app } from './app.js';
import connectDB from './db/index.js';
import { configureCloudinary } from './utilities/cloudinary.js';

const PORT = process.env.PORT || 8000;

try {
  configureCloudinary();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

connectDB()
  .then(() => {
    app.listen(PORT);
  })
  .catch(err => {
    process.exit(1);
  });

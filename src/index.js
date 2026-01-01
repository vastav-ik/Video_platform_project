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
    app.listen(PORT, () => {
      console.log(`\n⚙️  Server is running at port : ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err);
  });

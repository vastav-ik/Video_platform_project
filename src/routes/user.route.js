import { Router } from 'express';
import { registerUser } from '../controllers/usercontroller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { loginUser } from '../controllers/usercontroller.js';
const router = Router();

router.route('/register').post(
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  registerUser
);

router.route('/login').post(loginUser);

export default router;

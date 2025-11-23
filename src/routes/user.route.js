import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
  updateUserPassword,
} from '../controllers/usercontroller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/register').post(
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  registerUser
);

router.route('/login').post(loginUser);
router.route('/refresh-token').post(refreshAccessToken);

// Protected Routes (require verifyJWT middleware)
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/update-details').patch(verifyJWT, updateUserDetails);
router.route('/change-password').patch(verifyJWT, updateUserPassword);

// File upload routes (require multer middleware along with verifyJWT)
router.route('/update-avatar').patch(
  verifyJWT,
  upload.single('avatar'), // 'avatar' must match the field name in the form data
  updateUserAvatar
);
router.route('/update-cover-image').patch(
  verifyJWT,
  upload.single('coverImage'), // 'coverImage' must match the field name in the form data
  updateUserCoverImage
);

export default router;

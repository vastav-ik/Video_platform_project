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
  getUserChannelProfile,
  searchUsers,
} from '../controllers/usercontroller.js';
import {
  verifyJWT,
  optionalVerifyJWT,
} from '../middlewares/auth.middleware.js';
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

router.route('/logout').post(verifyJWT, logoutUser);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/update-details').patch(verifyJWT, updateUserDetails);
router.route('/change-password').patch(verifyJWT, updateUserPassword);

router
  .route('/update-avatar')
  .patch(verifyJWT, upload.single('avatar'), updateUserAvatar);

router
  .route('/update-cover-image')
  .patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage);

import { optionalAuth } from '../middlewares/optionalAuth.middleware.js';

router.route('/c/:username').get(optionalAuth, getUserChannelProfile);
router.route('/search').get(optionalVerifyJWT, searchUsers);

export default router;

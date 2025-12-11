import { Router } from 'express';
import {
  toggleVideoLike,
  toggleCommentLike,
  toggleCardLike,
  getLikedVideos,
} from '../controllers/like.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/toggle/v/:videoId').post(toggleVideoLike);
router.route('/toggle/c/:cardId').post(toggleCardLike);
router.route('/toggle/comment/:commentId').post(toggleCommentLike);

router.route('/videos').get(getLikedVideos);

export default router;

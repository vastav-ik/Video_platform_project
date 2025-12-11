import { Router } from 'express';
import {
  getVideoComments,
  getCardComments,
  addVideoComment,
  addCardComment,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router
  .route('/video/:videoId')
  .get(getVideoComments)
  .post(verifyJWT, addVideoComment);
router
  .route('/card/:cardId')
  .get(getCardComments)
  .post(verifyJWT, addCardComment);

router
  .route('/:commentId')
  .delete(verifyJWT, deleteComment)
  .patch(verifyJWT, updateComment);

export default router;

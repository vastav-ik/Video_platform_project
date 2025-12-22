import { Router } from 'express';
import {
  createCard,
  getUserCards,
  getCardById,
  updateCard,
  deleteCard,
} from '../controllers/card.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/user/:userId').get(getUserCards);
router.route('/:cardId').get(getCardById);

router.route('/').post(
  verifyJWT,
  upload.fields([
    {
      name: 'image',
      maxCount: 1,
    },
    {
      name: 'video',
      maxCount: 1,
    },
  ]),
  createCard
);

router
  .route('/:cardId')
  .patch(verifyJWT, updateCard)
  .delete(verifyJWT, deleteCard);

export default router;

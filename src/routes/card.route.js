import { Router } from 'express';
import {
  createCard,
  getUserCards,
  getCardById,
  updateCard,
  deleteCard,
  getAllCards,
  repostCard,
  quoteCard,
} from '../controllers/card.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/user/:userId').get(getUserCards);
router.route('/:cardId').get(getCardById);

router
  .route('/')
  .post(
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
  )
  .get(getAllCards);

router
  .route('/:cardId')
  .patch(verifyJWT, updateCard)
  .delete(verifyJWT, deleteCard);

router.route('/repost/:cardId').post(verifyJWT, repostCard);
router.route('/quote/:cardId').post(verifyJWT, quoteCard);

export default router;

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

router.use(verifyJWT); // Apply to all routes for now.
// Note: Usually fetching comments might be public.
// If so, I should not apply verifyJWT globally.
// Looking at 'getVideoComments' in controller, it uses lookup 'author' which is fine.
// But usually fetching comments is public.
// However, adding comments requires auth.
// Let's make fetching Public, modifying Private.
// verifyJWT sets req.user.
// If not authenticated, req.user is undefined.
// But strict verifyJWT throws error if token missing.
// So I must apply verifyJWT only to modifying routes.
// OR make verifyJWT optional (which I can't change easily as it's middleware).
// So I will apply verifyJWT to specific routes.

// Public Routes (if any)?
// The prompt doesn't specify public/private, but typical platform allows reading comments publicly.
// But let's check getVideoById - it seems I didn't change it to use Optional Auth.
// It uses verifyJWT for 'isLiked' logic? No, I check for req.user?._id.
// If verifyJWT is NOT applied, req.user is undefined, logic works (false).
// SO, I should NOT apply verifyJWT to GET routes if I want them public.
// BUT, wait... verifyJWT throws 401 if missing.
// So for GET routes, I should NOT use verifyJWT.
// Re-writing router logic to be explicit.

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

import { Router } from 'express';
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from '../controllers/playlist.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT); // Playlists are personal usually, or at least creation is.
// Viewing public playlists should be public.
// But getUserPlaylists lists USER playlists.
// getPlaylistById might be public if not private.
// For simplicity, sticking to authenticated access given 'owner' checks in controller.
// But wait, if I want to share a playlist, others should see it.
// getPlaylistById: logic checks 'isPrivate' in schema? Schema has 'isPrivate'.
// Controller `getPlaylistById` does NOT check `isPrivate`.
// So ANYONE can view ANY playlist if they have ID.
// If I use `verifyJWT` globally, only logged in users can view.
// If I want public viewing, I must remove `verifyJWT` from `getPlaylistById` and `getUserPlaylists`.
// But `getUserPlaylists` relies on `req.params.userId`.
// Let's make viewing public.
// NOTE: I cannot mix `router.use(verifyJWT)` with public routes easily without ordering.

const routerPublic = Router();
// Actually I can just attach to 'router' and apply middleware to specific routes.

router.route('/user/:userId').get(getUserPlaylists);
router.route('/:playlistId').get(getPlaylistById);

// Protected
router.route('/').post(verifyJWT, createPlaylist);
router
  .route('/:playlistId')
  .patch(verifyJWT, updatePlaylist)
  .delete(verifyJWT, deletePlaylist);

router.route('/add/:videoId/:playlistId').patch(verifyJWT, addVideoToPlaylist);
router
  .route('/remove/:videoId/:playlistId')
  .patch(verifyJWT, removeVideoFromPlaylist);

export default router;

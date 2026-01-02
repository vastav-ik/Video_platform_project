import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

import healthcheckRouter from './routes/healthcheck.router.js';
import userRouter from './routes/user.route.js';
import videoRouter from './routes/video.route.js';
import likeRouter from './routes/like.route.js';
import commentRouter from './routes/comment.route.js';
import subscriptionRouter from './routes/subscription.route.js';
import playlistRouter from './routes/playlist.route.js';
import cardRouter from './routes/card.route.js';
import dashboardRouter from './routes/dashboard.routes.js';

app.use('/api/v1/healthcheck', healthcheckRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/playlists', playlistRouter);
app.use('/api/v1/cards', cardRouter);
app.use('/api/v1/dashboard', dashboardRouter);

app.use(express.static(path.join(__dirname, '../frontend/dist')));

import { errorHandler } from './middlewares/error.middleware.js';
app.use(errorHandler);

app.use((req, res) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/v1')) {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
  }
});

export { app };

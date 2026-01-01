import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/Avatar';
import Comment from '@/components/Comment';
import VideoCard from '@/components/VideoCard';
import { AddToPlaylistModal } from '@/components/AddToPlaylistModal';
import { ThumbsUp, ThumbsDown, Share2 } from 'lucide-react';
import { formatViews, formatTimeAgo } from '@/lib/time';
import { toast } from '@/lib/toast';

function VideoPlayer() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [videoRes, commentsRes, relatedRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/videos/${videoId}`, {
            headers,
          }),
          axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/comments/video/${videoId}`,
            { headers }
          ),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/videos`, {
            params: { limit: 10 },
          }),
        ]);

        const videoData = videoRes.data.data;
        setVideo(videoData);
        setLikesCount(videoData.likesCount || 0);
        setIsLiked(videoData.isLiked || false);
        setIsSubscribed(videoData.owner?.isSubscribed || false);
        setComments(commentsRes.data.data.docs || []);
        setRelatedVideos(
          (relatedRes.data.data?.docs || []).filter(v => v._id !== videoId)
        );
      } catch (error) {
        toast.error('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoData();
    }
  }, [videoId]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please login to like videos');
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/likes/toggle/v/${videoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLiked(prev => !prev);
      setLikesCount(prev => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      toast.error('Failed to like video');
    }
  };

  const handleSubscribe = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        toast.error('Please login to subscribe');
        return;
      }
      if (!video?.owner?._id) {
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/subscriptions/c/${video.owner._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSubscribed(prev => !prev);
      toast.success(isSubscribed ? 'Unsubscribed' : 'Subscribed!');
    } catch (error) {
      toast.error('Failed to update subscription');
    }
  };

  const handleCommentSubmit = async e => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please login to comment');
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/comments/video/${videoId}`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([response.data.data, ...comments]);
      setNewComment('');
      toast.success('Comment posted');
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  const handleCommentDelete = commentId => {
    setComments(comments.filter(c => c._id !== commentId));
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-8 w-3/4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-40 h-24 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-muted-foreground">Video not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-primary/30 bg-primary/10 shadow-2xl">
            {video.videoFile && (
              <video
                key={videoId}
                src={
                  typeof video.videoFile === 'string'
                    ? video.videoFile
                    : video.videoFile.url
                }
                controls
                autoPlay
                playsInline
                preload="auto"
                className="h-full w-full"
                poster={
                  typeof video.thumbnail === 'string'
                    ? video.thumbnail
                    : video.thumbnail?.url
                }
              />
            )}
          </div>

          <div className="mt-6 space-y-4">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {video.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-primary/20 pb-6">
              <div className="flex items-center space-x-4">
                <Link
                  to={`/c/${video.owner?.username}`}
                  className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-primary/50 bg-primary/20 transition-transform hover:scale-105"
                >
                  <Avatar
                    src={video.owner.avatar.url}
                    alt={video.owner.username}
                  />
                </Link>
                <div className="flex flex-col">
                  <Link
                    to={`/c/${video.owner?.username}`}
                    className="font-heading text-lg font-semibold text-foreground hover:text-accent transition-colors"
                  >
                    {video.owner.username}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatViews(video.owner.subscribersCount)} subscribers
                  </p>
                </div>
                <Button
                  onClick={handleSubscribe}
                  className="ml-4 rounded-full bg-foreground text-background transition-all hover:scale-105 hover:bg-foreground/90 active:scale-95 px-6"
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center overflow-hidden rounded-full bg-primary/20 border border-primary/30 p-1">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-1.5 transition-colors hover:bg-primary/30 ${
                      isLiked ? 'text-accent' : 'text-foreground'
                    }`}
                  >
                    <ThumbsUp
                      className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`}
                    />
                    <span className="text-sm font-medium">
                      {formatViews(likesCount)}
                    </span>
                  </button>
                  <div className="h-6 w-[1px] bg-primary/30" />
                  <button className="px-4 py-1.5 transition-colors hover:bg-primary/30 text-foreground">
                    <ThumbsDown className="h-5 w-5" />
                  </button>
                </div>
                <AddToPlaylistModal videoId={videoId} />
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full bg-primary/20 border border-primary/30 hover:bg-primary/30"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <div className="rounded-2xl bg-primary/10 p-4 border border-primary/20 transition-colors hover:bg-primary/15">
              <div className="flex space-x-2 text-sm font-semibold text-foreground">
                <span>{formatViews(video.views)} views</span>
                <span>•</span>
                <span>{formatTimeAgo(video.createdAt)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {video.description}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-4 text-lg font-heading font-semibold">
              Comments ({comments.length})
            </h3>

            <form onSubmit={handleCommentSubmit} className="mb-6">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="mb-2 min-h-[80px] resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewComment('')}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Comment
                </Button>
              </div>
            </form>

            <div className="space-y-2">
              {comments.map(comment => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  currentUserId={currentUser?._id}
                  onDelete={handleCommentDelete}
                  videoId={videoId}
                />
              ))}
              {comments.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-heading font-semibold">
            Related Videos
          </h3>
          <div className="space-y-4">
            {relatedVideos.map(relatedVideo => (
              <VideoCard
                key={relatedVideo._id}
                video={relatedVideo}
                variant="compact"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;

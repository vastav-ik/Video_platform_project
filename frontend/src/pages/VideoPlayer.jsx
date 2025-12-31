import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddToPlaylistModal } from '@/components/AddToPlaylistModal';

function VideoPlayer() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const videoRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/videos/${videoId}`,
          { headers }
        );
        const videoData = videoRes.data.data;
        setVideo(videoData);
        setLikesCount(videoData.likesCount || 0);
        setIsLiked(videoData.isLiked || false);
        setIsSubscribed(videoData.owner?.isSubscribed || false);

        const commentsRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/comments/video/${videoId}`,
          { headers }
        );
        setComments(commentsRes.data.data.docs || []);
      } catch (error) {
        console.error('Error fetching data', error);
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
      if (!token) return alert('Please login to like');

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/likes/toggle/v/${videoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLiked(prev => !prev);
      setLikesCount(prev => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error('Error liking video', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return alert('Please login to subscribe');
      if (!video?.owner?._id) return;

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/subscriptions/c/${video.owner._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSubscribed(prev => !prev);
    } catch (error) {
      console.error('Error subscribing', error);
    }
  };

  const handleCommentSubmit = async e => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return alert('Please login to comment');

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/comments/video/${videoId}`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([response.data.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!video) return <div className="p-8 text-center">Video not found.</div>;

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            {video.videoFile?.url && (
              <video
                src={video.videoFile.url.replace('http://', 'https://')}
                controls
                autoPlay
                className="h-full w-full"
                poster={video.thumbnail?.url}
              />
            )}
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
              <div>
                {video.views} views •{' '}
                {new Date(video.createdAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={isLiked ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleLike}
                >
                  {isLiked ? 'Liked' : 'Like'} ({likesCount})
                </Button>
                <AddToPlaylistModal videoId={videoId} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-y py-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                  {video.owner?.avatar?.url && (
                    <img
                      src={video.owner.avatar.url}
                      alt={video.owner?.username}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{video.owner?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {video.owner?.subscribersCount || 0} subscribers
                  </p>
                </div>
              </div>
              <Button
                variant={isSubscribed ? 'secondary' : 'default'}
                onClick={handleSubscribe}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </Button>
            </div>

            <div className="mt-4 rounded-lg border p-4 text-sm">
              <p className="whitespace-pre-wrap">{video.description}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">
            Comments ({comments.length})
          </h3>
          <form onSubmit={handleCommentSubmit} className="mb-6 flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <Button type="submit" size="sm">
              Post
            </Button>
          </form>

          <div className="space-y-4">
            {comments.map(comment => (
              <div
                key={comment._id}
                className="rounded-lg border bg-card p-3 text-card-foreground"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-muted overflow-hidden">
                    {comment.owner?.avatar?.url && (
                      <img
                        src={comment.owner.avatar.url}
                        alt={comment.owner?.username}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-xs font-semibold">
                    {comment.owner?.username || 'User'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;

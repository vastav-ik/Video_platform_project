import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from './Avatar';
import { Button } from './ui/button';
import { ThumbsUp, Trash2 } from 'lucide-react';
import { formatTimeAgo } from '@/lib/time';
import axios from 'axios';
import { toast } from '@/lib/toast';

function Comment({ comment, currentUserId, onDelete, videoId }) {
  const [likes, setLikes] = useState(comment.likesCount || 0);
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please login to like comments');
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/likes/toggle/c/${comment._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsLiked(prev => !prev);
      setLikes(prev => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error('Error liking comment', error);
      toast.error('Failed to like comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?'))
      return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/comments/c/${comment._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Comment deleted');
      if (onDelete) onDelete(comment._id);
    } catch (error) {
      console.error('Error deleting comment', error);
      toast.error('Failed to delete comment');
    }
  };

  const isOwner = currentUserId && currentUserId === comment.owner?._id;

  return (
    <div className="flex gap-4 items-start py-4 border-b border-border/50 last:border-0">
      <Link to={`/c/${comment.owner?.username}`}>
        <Avatar
          src={comment.owner?.avatar?.url}
          alt={comment.owner?.username}
          size="md"
          fallback={comment.owner?.username?.charAt(0)}
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <Link
            to={`/c/${comment.owner?.username}`}
            className="font-semibold text-sm hover:text-primary"
          >
            {comment.owner?.username || 'User'}
          </Link>
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(comment.createdAt)}
          </span>
        </div>

        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
          {comment.content}
        </p>

        <div className="flex items-center gap-4 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={loading}
            className={`h-8 gap-1.5 ${isLiked ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            {likes > 0 && <span className="text-xs">{likes}</span>}
          </Button>

          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-xs">Delete</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Comment;

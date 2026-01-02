import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from './Avatar';
import { Button } from './ui/button';
import { ThumbsUp, Trash2 } from 'lucide-react';
import { formatTimeAgo } from '@/lib/time';
import api from '@/lib/api';
import { toast } from '@/lib/toast';

function Comment({ comment, currentUserId, onDelete }) {
  const [likes, setLikes] = useState(comment.likesCount || 0);
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await api.post(`/likes/toggle/c/${comment._id}`);
      setIsLiked(prev => !prev);
      setLikes(prev => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      toast.error('Failed to update like');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${comment._id}`);
      toast.success('Comment deleted');
      if (onDelete) onDelete(comment._id);
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const isOwner = currentUserId === comment.owner?._id;

  return (
    <div className="flex gap-4 items-start py-4 border-b border-border/50 last:border-0 transition-all hover:bg-primary/[0.01] px-2 rounded-xl">
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
            className="font-bold text-sm hover:text-primary transition-colors"
          >
            {comment.owner?.username || 'User'}
          </Link>
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter opacity-50">
            {formatTimeAgo(comment.createdAt)}
          </span>
        </div>

        <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed font-medium">
          {comment.content}
        </p>

        <div className="flex items-center gap-4 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={loading}
            className={`h-8 gap-1.5 rounded-full hover:bg-primary/10 transition-all ${isLiked ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            {likes > 0 && <span className="text-xs font-bold">{likes}</span>}
          </Button>

          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-xs font-bold">Delete</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Comment;

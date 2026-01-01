import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDuration, formatTimeAgo, formatViews } from '@/lib/time';

function VideoCard({ video, variant = 'default' }) {
  const navigate = useNavigate();
  if (!video) return null;

  const handleCardClick = () => {
    navigate(`/videos/${video._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group flex flex-col overflow-hidden rounded-xl border border-primary/30 bg-card transition-all hover:border-accent/50 hover:shadow-xl cursor-pointer ${
        variant === 'compact'
          ? 'flex-row gap-3 border-0 bg-transparent p-1 hover:bg-primary/10'
          : ''
      } ${variant === 'sidebar' ? 'flex-row gap-2 border-0 bg-transparent p-1 hover:bg-primary/10' : ''}`}
    >
      <div
        className={`relative aspect-video overflow-hidden rounded-lg bg-primary/20 ${
          variant === 'compact' ? 'w-48 shrink-0' : 'w-full'
        } ${variant === 'sidebar' ? 'w-32 shrink-0' : ''}`}
      >
        <img
          src={
            typeof video.thumbnail === 'string'
              ? video.thumbnail
              : video.thumbnail?.url
          }
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {formatDuration(video.duration)}
        </div>
        {video.status === 'members-only' && (
          <div className="absolute top-2 right-2 rounded bg-purple-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm border border-purple-400/30 shadow-lg">
            MEMBERS ONLY
          </div>
        )}
      </div>

      <div
        className={`flex flex-1 flex-col p-3 ${variant !== 'default' ? 'p-0 py-1' : ''}`}
      >
        <div className="flex gap-3">
          {variant === 'default' && (
            <div
              className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-primary/30 bg-primary/20 transition-transform hover:scale-110"
              onClick={e => {
                e.stopPropagation();
                navigate(`/c/${video.owner?.username}`);
              }}
            >
              {video.owner?.avatar?.url ? (
                <img
                  src={video.owner.avatar.url}
                  alt={video.owner.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-foreground">
                  {video.owner?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col gap-1 min-w-0">
            <h3
              className={`line-clamp-2 font-heading font-semibold leading-tight text-foreground transition-colors group-hover:text-accent ${
                variant === 'default' ? 'text-base' : 'text-sm'
              }`}
            >
              {video.title}
            </h3>
            <div className="flex flex-col text-xs text-muted-foreground">
              {variant === 'default' && (
                <div
                  className="hover:text-accent transition-colors w-fit"
                  onClick={e => {
                    e.stopPropagation();
                    navigate(`/c/${video.owner?.username}`);
                  }}
                >
                  {video.owner?.username}
                </div>
              )}
              <div className="flex items-center gap-1">
                <span>{formatViews(video.views)} views</span>
                <span className="text-[8px] opacity-40">•</span>
                <span>
                  {new Date(video.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;

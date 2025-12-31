import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from './Avatar';
import { formatDuration, formatTimeAgo, formatViews } from '@/lib/time';

function VideoCard({ video, variant = 'default' }) {
  if (!video) return null;

  const isCompact = variant === 'compact' || variant === 'sidebar';

  if (isCompact) {
    return (
      <div className="group flex gap-3 cursor-pointer hover:bg-muted/30 rounded-xl p-2 transition-colors">
        <Link
          to={`/videos/${video._id}`}
          className="block w-40 h-24 shrink-0 bg-muted rounded-lg overflow-hidden relative"
        >
          {video.thumbnail?.url && (
            <img
              src={video.thumbnail.url}
              alt={video.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          )}
          {video.duration && (
            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </span>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <Link to={`/videos/${video._id}`}>
            <h3 className="font-heading font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary">
              {video.title}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">
            {video.owner?.username}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col gap-3 cursor-pointer">
      <Link to={`/videos/${video._id}`}>
        <div className="aspect-video rounded-xl overflow-hidden bg-muted relative">
          {video.thumbnail?.url ? (
            <img
              src={video.thumbnail.url}
              alt={video.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              No Thumbnail
            </div>
          )}
          {video.duration && (
            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </span>
          )}
        </div>
      </Link>

      <div className="flex gap-3">
        <Link to={`/c/${video.owner?.username}`}>
          <Avatar
            src={video.owner?.avatar?.url}
            alt={video.owner?.username}
            size="md"
            fallback={video.owner?.username?.charAt(0)}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/videos/${video._id}`}>
            <h3 className="font-heading font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {video.title}
            </h3>
          </Link>
          <Link
            to={`/c/${video.owner?.username}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-1 inline-block"
          >
            {video.owner?.username}
          </Link>
          <p className="text-xs text-muted-foreground">
            {formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;

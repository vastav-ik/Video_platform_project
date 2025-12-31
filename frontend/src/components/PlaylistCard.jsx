import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ListVideo } from 'lucide-react';

function PlaylistCard({ playlist }) {
  if (!playlist) return null;

  const thumbnailUrl =
    playlist.videos?.[0]?.thumbnail?.url ||
    playlist.videos?.[0]?.thumbnail ||
    null;
  const videoCount = playlist.videos?.length || playlist.videoCount || 0;

  return (
    <Link
      to={`/playlists/${playlist._id}`}
      className="group block cursor-pointer"
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
        {/* Stacked thumbnail effect */}
        <div className="absolute inset-0 bg-card border-r-2 border-t-2 border-border translate-x-1 translate-y-1 rounded-xl" />
        <div className="absolute inset-0 bg-card border-r border-t border-border translate-x-0.5 translate-y-0.5 rounded-xl" />

        {/* Main thumbnail */}
        <div className="relative h-full w-full">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={playlist.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted">
              <ListVideo className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-y-0 right-0 w-2/5 bg-gradient-to-l from-black/80 to-transparent flex flex-col items-center justify-center text-white">
            <Play className="h-8 w-8 mb-2" />
            <span className="text-sm font-semibold">
              {videoCount} {videoCount === 1 ? 'video' : 'videos'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <h3 className="font-heading font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {playlist.name}
        </h3>
        {playlist.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {playlist.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          By {playlist.owner?.username || 'Unknown'}
        </p>
      </div>
    </Link>
  );
}

export default PlaylistCard;

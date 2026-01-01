import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar } from './Avatar';

function ChannelCard({ channel }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      <Link
        to={`/c/${channel.username}`}
        className="flex items-center gap-4 flex-1 min-w-0"
      >
        <Avatar
          src={channel.avatar?.url}
          alt={channel.username}
          fallback={channel.username?.charAt(0).toUpperCase()}
          className="h-16 w-16 border-2 border-primary/10"
        />

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg leading-tight truncate">
            {channel.fullName}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            @{channel.username}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {channel.subscribersCount} subscribers
          </p>
        </div>
      </Link>

      <Link to={`/c/${channel.username}`}>
        <Button variant="secondary" size="sm" className="rounded-full">
          View Channel
        </Button>
      </Link>
    </div>
  );
}

export default ChannelCard;

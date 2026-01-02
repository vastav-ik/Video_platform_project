import React from 'react';
import { Link } from 'react-router-dom';

export const Card = ({ card }) => {
  if (!card) return null;

  return (
    <div className="group relative flex flex-col rounded-3xl border border-primary/10 bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/30">
      <div className="mb-6 flex items-center gap-4">
        <Link
          to={`/c/${card.author?.username}`}
          className="relative h-14 w-14 overflow-hidden rounded-2xl bg-muted p-0.5 shadow-md ring-2 ring-primary/10 transition-all hover:scale-105 active:scale-95"
        >
          {card.author?.avatar?.url ? (
            <img
              src={card.author.avatar.url}
              alt={card.author.username}
              className="h-full w-full rounded-[14px] object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/5 text-xl font-bold text-primary">
              {card.author?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </Link>
        <div>
          <p className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">
            {card.author?.username || 'Anonymous'}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
            {new Date(card.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="relative flex-1">
        <p className="relative z-10 whitespace-pre-wrap text-lg leading-relaxed text-foreground/80 group-hover:text-foreground transition-colors font-medium">
          {card.content}
        </p>

        {card.image && (
          <img
            src={card.image}
            alt="Post"
            className="mt-4 rounded-2xl w-full object-cover max-h-96 shadow-lg"
          />
        )}
      </div>
    </div>
  );
};

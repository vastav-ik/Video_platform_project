import React from 'react';
import { Link } from 'react-router-dom';

export const Card = ({ card }) => {
  return (
    <div className="group relative flex flex-col rounded-3xl border border-primary/10 bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          to={`/c/${card.author?.username}`}
          className="relative h-14 w-14 overflow-hidden rounded-2xl bg-muted p-0.5 shadow-md ring-2 ring-primary/10 transition-all group-hover:ring-primary/30 hover:scale-105 active:scale-95 cursor-pointer"
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
          <p className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
            {card.author?.username || 'Anonymous'}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
            {new Date(card.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>
      </div>
      <div className="relative flex-1">
        <span className="absolute -left-2 -top-2 scale-150 text-4xl opacity-5">
          "
        </span>
        <p className="relative z-10 whitespace-pre-wrap text-lg leading-relaxed text-foreground/80 group-hover:text-foreground transition-colors">
          {card.content}
        </p>

        {card.image && (
          <img
            src={card.image}
            alt="Post content"
            className="mt-4 rounded-2xl w-full object-cover max-h-96"
          />
        )}
      </div>
      <div className="mt-8 flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors cursor-pointer">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

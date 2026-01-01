import React from 'react';
import { cn } from '@/lib/utils';

const avatarSizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-20 w-20',
  xl: 'h-32 w-32',
};

function Avatar({ src, alt = 'Avatar', size = 'md', className, fallback }) {
  const [error, setError] = React.useState(false);

  return (
    <div
      className={cn(
        'rounded-full bg-primary/20 overflow-hidden shrink-0 border border-primary/30',
        avatarSizes[size],
        className
      )}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-primary/20 text-accent font-bold uppercase">
          {fallback || alt?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
    </div>
  );
}

export { Avatar };

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import VideoCard from '@/components/VideoCard';
import { Skeleton } from '@/components/ui/skeleton';

function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/videos`,
          {
            params: {
              query: query || undefined,
              page: 1,
              limit: 12,
            },
          }
        );
        setVideos(response.data.data?.docs || response.data.data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [query]);

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-heading font-bold">
        {query ? `Search results for "${query}"` : 'Recommended'}
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-video w-full" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {query ? `No videos found for "${query}"` : 'No videos available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map(video => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;

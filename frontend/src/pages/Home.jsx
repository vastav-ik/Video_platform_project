import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import VideoCard from '@/components/VideoCard';
import ChannelCard from '@/components/ChannelCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Video, Search } from 'lucide-react';

function Home() {
  const [videos, setVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const videoPromise = axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/videos`,
          {
            params: {
              query: query || undefined,
              page: 1,
              limit: 12,
            },
          }
        );

        let channelPromise = Promise.resolve({ data: { data: [] } });
        if (query) {
          channelPromise = axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/users/search`,
            {
              params: { query },
            }
          );
        }

        const [videoRes, channelRes] = await Promise.all([
          videoPromise,
          channelPromise,
        ]);

        setVideos(videoRes.data.data?.docs || videoRes.data.data || []);
        setChannels(channelRes.data.data || []);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="mb-8 font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        {query ? `Search results for "${query}"` : 'Recommended'}
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-video w-full rounded-xl bg-primary/20" />
              <div className="flex gap-3 px-1">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-primary/20" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full bg-primary/20" />
                  <Skeleton className="h-4 w-3/4 bg-primary/20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 && channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-6">
            <Search className="h-10 w-10 text-primary" />
          </div>
          <p className="text-xl font-medium text-foreground">
            {query ? `No results found for "${query}"` : 'No videos available'}
          </p>
          <p className="mt-2 text-muted-foreground">
            Try searching for something else or explore our homepage.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Channels Section */}
          {channels.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                Channels & Creators
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {channels.map(channel => (
                  <ChannelCard key={channel._id} channel={channel} />
                ))}
              </div>
            </div>
          )}

          {/* Videos Section */}
          <div className="space-y-4">
            {channels.length > 0 && videos.length > 0 && (
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                Videos
              </h2>
            )}
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map(video => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;

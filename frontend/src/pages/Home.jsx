import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';

function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/videos`
        );
        // aggregatePaginate returns { docs: [], ... }
        // Our ApiResponse wraps it in data: { ... }
        // So response.data.data.docs ?
        console.log('Fetched videos:', response.data);
        setVideos(response.data.data?.docs || response.data.data || []);
      } catch (error) {
        console.error('Error fetching videos', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Recommended</h1>
      {videos.length === 0 ? (
        <p>No videos found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map(video => (
            <div
              key={video._id}
              className="overflow-hidden rounded-lg border bg-card text-card-foreground group"
            >
              <div className="relative aspect-video bg-muted">
                {video.thumbnail?.url && (
                  <img
                    src={video.thumbnail.url}
                    alt={video.title}
                    className="h-full w-full object-cover transition-all hover:scale-105"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-lg font-semibold leading-tight tracking-tight">
                  {video.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {video.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {video.views} views
                  </div>
                  <Link to={`/videos/${video._id}`}>
                    <Button variant="secondary" size="sm">
                      Watch
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;

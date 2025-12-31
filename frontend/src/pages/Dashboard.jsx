import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UploadVideoModal } from '@/components/UploadVideoModal';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return; // Redirect to login?

        const headers = { Authorization: `Bearer ${token}` };

        const statsRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/dashboard/stats`,
          { headers }
        );
        setStats(statsRes.data.data);

        const videosRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/dashboard/videos`,
          { headers }
        );
        setVideos(videosRes.data.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Channel Dashboard</h1>
        <UploadVideoModal />
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 text-card-foreground">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Views
          </h3>
          <div className="mt-2 text-2xl font-bold">
            {stats?.totalViews || 0}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Subscribers
          </h3>
          <div className="mt-2 text-2xl font-bold">
            {stats?.totalSubscribers || 0}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Likes
          </h3>
          <div className="mt-2 text-2xl font-bold">
            {stats?.totalLikes || 0}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Videos
          </h3>
          <div className="mt-2 text-2xl font-bold">
            {stats?.totalVideos || 0}
          </div>
        </div>
      </div>

      {/* Videos List */}
      <h2 className="mb-4 text-xl font-semibold">Your Videos</h2>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="grid grid-cols-4 gap-4 border-b p-4 text-sm font-medium">
          <div className="col-span-2">Video</div>
          <div>Status</div>
          <div>Date Uploaded</div>
        </div>
        {videos.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No videos uploaded yet.
          </div>
        ) : (
          videos.map(video => (
            <div
              key={video._id}
              className="grid grid-cols-4 items-center gap-4 border-b p-4 text-sm last:border-0 hover:bg-muted/50 transition-colors"
            >
              <div className="col-span-2 flex items-center gap-3">
                <div className="h-10 w-16 overflow-hidden rounded bg-muted">
                  {video.videoFile?.url && (
                    <img
                      src={video.thumbnail?.url || video.videoFile.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <span className="font-medium">{video.title}</span>
              </div>
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${video.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                >
                  {video.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="text-muted-foreground">
                {video.createdAt?.day}/{video.createdAt?.month}/
                {video.createdAt?.year}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;

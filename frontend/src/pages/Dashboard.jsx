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
        if (!token) return;

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
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Channel Dashboard
        </h1>
        <UploadVideoModal />
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Views', value: stats?.totalViews || 0 },
          { label: 'Total Subscribers', value: stats?.totalSubscribers || 0 },
          { label: 'Total Likes', value: stats?.totalLikes || 0 },
          { label: 'Total Videos', value: stats?.totalVideos || 0 },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl border border-primary/30 bg-card p-6 shadow-sm transition-all hover:border-accent/30 hover:shadow-xl"
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </h3>
            <div className="mt-3 text-3xl font-bold text-foreground">
              {stat.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-primary/30 bg-card overflow-hidden shadow-xl">
        <div className="flex items-center justify-between border-b border-primary/20 bg-primary/5 px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">Your Videos</h2>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            {videos.length} Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-primary/10 bg-primary/5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Video</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Date Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {videos.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-sm text-muted-foreground italic"
                  >
                    No videos uploaded yet.
                  </td>
                </tr>
              ) : (
                videos.map(video => (
                  <tr
                    key={video._id}
                    className="group hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-16 overflow-hidden rounded-md bg-primary/20 border border-primary/30">
                          <img
                            src={video.thumbnail?.url || video.videoFile.url}
                            alt=""
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                          />
                        </div>
                        <span className="font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                          {video.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          video.isPublished
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}
                      >
                        {video.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {video.views?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                      {new Date(video.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

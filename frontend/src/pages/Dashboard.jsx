import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UploadVideoModal } from '@/components/UploadVideoModal';
import {
  Eye,
  Users,
  Heart,
  Video as VideoIcon,
  BarChart3,
  Clock,
  Globe,
  Lock,
} from 'lucide-react';

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

  const handleTogglePublish = async videoId => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/videos/toggle/publish/${videoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVideos(prev =>
        prev.map(video =>
          video._id === videoId
            ? { ...video, isPublished: !video.isPublished }
            : video
        )
      );
    } catch (error) {
      console.error('Failed to toggle publish status', error);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading dashboard...</div>;

  const statConfig = [
    {
      label: 'Total Views',
      value: stats?.totalViews || 0,
      icon: Eye,
      color: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Subscribers',
      value: stats?.totalSubscribers || 0,
      icon: Users,
      color: 'from-purple-500/20 to-purple-600/5',
      iconColor: 'text-purple-500',
    },
    {
      label: 'Total Likes',
      value: stats?.totalLikes || 0,
      icon: Heart,
      color: 'from-rose-500/20 to-rose-600/5',
      iconColor: 'text-rose-500',
    },
    {
      label: 'Videos',
      value: stats?.totalVideos || 0,
      icon: VideoIcon,
      color: 'from-amber-500/20 to-amber-600/5',
      iconColor: 'text-amber-500',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
            Channel Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance overview for your content
          </p>
        </div>
        <UploadVideoModal />
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statConfig.map((stat, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-[2rem] border border-primary/10 bg-gradient-to-br ${stat.color} p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`rounded-2xl bg-background/50 p-3 shadow-sm ${stat.iconColor}`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="h-2 w-2 rounded-full bg-primary/20" />
            </div>
            <div className="mt-6">
              <div className="text-4xl font-black tracking-tighter text-foreground">
                {stat.value.toLocaleString()}
              </div>
              <div className="mt-1 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                {stat.label}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
          </div>
        ))}
      </div>

      <div className="rounded-[2.5rem] border border-primary/10 bg-card overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-primary/5 bg-primary/5 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <VideoIcon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-foreground">
              Content Manager
            </h2>
          </div>
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
            {videos.length} Total Uploads
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-primary/5 bg-muted/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                <th className="px-8 py-5">Video</th>
                <th className="px-8 py-5">Visibility</th>
                <th className="px-8 py-5 text-center">Performance</th>
                <th className="px-8 py-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-4 rounded-full bg-muted p-6">
                        <VideoIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-lg font-bold text-muted-foreground">
                        No content yet
                      </p>
                      <p className="text-sm text-muted-foreground/60">
                        Upload your first video to see performance data here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                videos.map(video => (
                  <tr
                    key={video._id}
                    className="group hover:bg-primary/[0.02] transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-muted shadow-md ring-1 ring-primary/5 transition-all group-hover:ring-primary/20">
                          <img
                            src={video.thumbnail?.url || video.videoFile.url}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <span className="max-w-[200px] font-bold text-foreground transition-colors group-hover:text-primary line-clamp-2 leading-tight">
                          {video.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button
                        onClick={() => handleTogglePublish(video._id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity ${
                          video.isPublished
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {video.isPublished ? (
                          <>
                            <Globe className="h-3 w-3" /> Public
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" /> Private
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-lg font-black text-foreground">
                          {video.views?.toLocaleString() || 0}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase opacity-50">
                          <Eye className="h-3 w-3" /> Views
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-foreground">
                          {new Date(video.createdAt).toLocaleDateString(
                            undefined,
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase opacity-50">
                          <Clock className="h-3 w-3" /> Published
                        </div>
                      </div>
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

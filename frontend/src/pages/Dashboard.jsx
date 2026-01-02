import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { UploadVideoModal } from '@/components/UploadVideoModal';
import { toast } from '@/lib/toast';
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
        const [statsRes, videosRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/videos'),
        ]);
        setStats(statsRes.data.data);
        setVideos(videosRes.data.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleTogglePublish = async videoId => {
    try {
      await api.patch(`/videos/toggle/publish/${videoId}`);
      setVideos(prev =>
        prev.map(video =>
          video._id === videoId
            ? { ...video, isPublished: !video.isPublished }
            : video
        )
      );
      toast.success('Visibility updated');
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading dashboard...
      </div>
    );

  const statConfig = [
    {
      label: 'Total Views',
      value: stats?.totalViews || 0,
      icon: Eye,
      color: 'from-blue-500/20',
    },
    {
      label: 'Subscribers',
      value: stats?.totalSubscribers || 0,
      icon: Users,
      color: 'from-purple-500/20',
    },
    {
      label: 'Total Likes',
      value: stats?.totalLikes || 0,
      icon: Heart,
      color: 'from-rose-500/20',
    },
    {
      label: 'Videos',
      value: stats?.totalVideos || 0,
      icon: VideoIcon,
      color: 'from-amber-500/20',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Channel Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance overview
          </p>
        </div>
        <UploadVideoModal />
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statConfig.map((stat, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br ${stat.color} p-8 shadow-xl transition-transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-background/50 p-3 shadow-sm">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-6">
              <div className="text-4xl font-black tracking-tighter">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[2.5rem] border border-primary/10 bg-card overflow-hidden shadow-2xl overflow-x-auto">
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
                  <p className="text-lg font-bold text-muted-foreground">
                    No content yet
                  </p>
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
                      <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-muted shadow-md">
                        <img
                          src={video.thumbnail?.url || video.videoFile.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="max-w-[200px] font-bold transition-colors group-hover:text-primary line-clamp-2">
                        {video.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button
                      onClick={() => handleTogglePublish(video._id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
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
                  <td className="px-8 py-6 text-center">
                    <span className="text-lg font-black">
                      {video.views?.toLocaleString() || 0}
                    </span>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">
                      Views
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;

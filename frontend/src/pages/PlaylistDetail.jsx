import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Trash2, Play } from 'lucide-react';

function PlaylistDetail() {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/playlists/${playlistId}`,
          { headers }
        );
        setPlaylist(response.data.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [playlistId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/playlists/${playlistId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/playlists');
    } catch (error) {}
  };

  const handleRemoveVideo = async videoId => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/playlists/remove/${videoId}/${playlistId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlaylist(prev => ({
        ...prev,
        videos: prev.videos.filter(v => v._id !== videoId),
      }));
    } catch (error) {}
  };

  if (loading)
    return <div className="p-8 text-center">Loading playlist...</div>;
  if (!playlist)
    return <div className="p-8 text-center">Playlist not found</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      {/* Hero Section */}
      <div className="group relative mb-12 overflow-hidden rounded-[2.5rem] bg-card shadow-2xl transition-all duration-500 hover:shadow-primary/5">
        <div className="absolute inset-0 z-0">
          {playlist.videos.length > 0 && playlist.videos[0].thumbnail?.url && (
            <img
              src={playlist.videos[0].thumbnail.url}
              alt=""
              className="h-full w-full object-cover opacity-20 blur-3xl saturate-200 transition-transform duration-700 group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/40 to-primary/5 transition-opacity duration-500 group-hover:opacity-60" />
        </div>

        <div className="relative z-10 flex flex-col gap-10 p-8 md:flex-row md:items-end md:p-12">
          {/* Cover Art */}
          <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-3xl shadow-2xl md:h-72 md:w-72">
            {playlist.videos.length > 0 && playlist.videos[0].thumbnail?.url ? (
              <img
                src={playlist.videos[0].thumbnail.url}
                alt={playlist.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted/50 p-6 text-center text-muted-foreground backdrop-blur-sm">
                Empty Playlist
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl bg-black/40 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
              <Play className="h-3.3 w-3.3 fill-current" />
              {playlist.videos.length} VIDEOS
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            <nav className="mb-4 flex gap-2 text-xs font-black uppercase tracking-widest text-primary/60">
              <Link
                to="/playlists"
                className="hover:text-primary transition-colors"
              >
                Playlists
              </Link>
              <span>/</span>
              <span className="text-muted-foreground">{playlist.name}</span>
            </nav>

            <h1 className="mb-4 text-4xl font-black tracking-tighter text-foreground md:text-6xl">
              {playlist.name}
            </h1>

            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground/90 line-clamp-2 transition-all hover:line-clamp-none">
              {playlist.description ||
                'No description provided for this collection.'}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-primary/20 shadow-md">
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 font-bold text-primary">
                    {playlist.owner?.username?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Created by
                  </span>
                  <span className="font-bold text-foreground">
                    {playlist.owner?.username}
                  </span>
                </div>
              </div>

              <div className="h-10 w-px bg-primary/10 hidden sm:block" />

              <div className="flex items-center gap-4">
                <Button className="h-14 rounded-2xl bg-primary px-8 font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-xl active:scale-95">
                  <Play className="mr-2 h-5 w-5 fill-current" /> Play All
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-2xl border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all active:scale-90 shadow-sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-primary/10 bg-card p-4 shadow-xl backdrop-blur-3xl">
        <div className="mb-6 flex items-center justify-between border-b border-primary/5 px-6 py-4">
          <h2 className="text-xl font-black tracking-tight text-foreground">
            Videos in this playlist
          </h2>
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
            {playlist.videos.length} Total
          </span>
        </div>

        <div className="space-y-2">
          {playlist.videos.map((video, index) => (
            <div
              key={video._id}
              className="group relative flex items-center gap-6 rounded-2xl p-4 transition-all duration-300 hover:bg-primary/5"
            >
              <div className="w-8 text-center text-sm font-black text-muted-foreground/40 group-hover:text-primary transition-colors">
                {(index + 1).toString().padStart(2, '0')}
              </div>

              <Link
                to={`/videos/${video._id}`}
                className="relative h-24 w-44 shrink-0 overflow-hidden rounded-xl bg-muted shadow-lg transition-transform duration-300 group-hover:scale-105"
              >
                {video.thumbnail?.url && (
                  <img
                    src={video.thumbnail.url}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={video.title}
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Play className="h-8 w-8 text-white fill-current" />
                </div>
              </Link>

              <div className="flex flex-1 flex-col justify-center min-w-0">
                <Link to={`/videos/${video._id}`}>
                  <h3 className="text-lg font-bold leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                </Link>
                <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                  <span className="font-bold text-foreground/70">
                    {video.owner?.username}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <span>{video.views.toLocaleString()} views</span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 px-4 opacity-0 transition-all translate-x-4 group-hover:opacity-100 group-hover:translate-x-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                  onClick={() => handleRemoveVideo(video._id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}

          {playlist.videos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="mb-6 rounded-full bg-primary/5 p-10">
                <Play className="h-12 w-12 text-primary/30" />
              </div>
              <p className="text-2xl font-black text-foreground/40">
                Empty Playlist
              </p>
              <p className="mt-2 text-muted-foreground max-w-xs">
                This collection is currently empty. Start adding some videos to
                see them here!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlaylistDetail;

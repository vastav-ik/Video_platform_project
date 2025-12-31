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
    <div className="container py-8 max-w-4xl">
      <div className="mb-8 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 aspect-video md:aspect-auto md:h-64 bg-muted rounded-xl relative overflow-hidden flex items-center justify-center shrink-0">
          {playlist.videos.length > 0 && playlist.videos[0].thumbnail?.url ? (
            <img
              src={playlist.videos[0].thumbnail.url}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground p-4 text-center">
              No Cover
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4 text-center">
            <h1 className="text-2xl font-bold mb-2">{playlist.name}</h1>
            <p className="text-sm opacity-80 mb-4">
              {playlist.videos.length} videos
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="default" className="rounded-full">
                <Play className="h-4 w-4 mr-1" /> Play All
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="rounded-full"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2 md:hidden">{playlist.name}</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {playlist.description ||
              'No description available for this playlist.'}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Created by {playlist.owner?.username}</span>
            <span>•</span>
            <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {playlist.videos.map((video, index) => (
          <div
            key={video._id}
            className="flex gap-4 p-2 rounded-lg hover:bg-muted/50 group"
          >
            <div className="text-muted-foreground w-6 flex items-center justify-center shrink-0">
              {index + 1}
            </div>
            <Link
              to={`/videos/${video._id}`}
              className="block h-20 w-36 bg-muted rounded-md overflow-hidden shrink-0"
            >
              {video.thumbnail?.url && (
                <img
                  src={video.thumbnail.url}
                  className="h-full w-full object-cover"
                />
              )}
            </Link>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <Link to={`/videos/${video._id}`}>
                <h3 className="font-semibold line-clamp-2 leading-tight group-hover:text-primary">
                  {video.title}
                </h3>
              </Link>
              <p className="text-xs text-muted-foreground mt-1">
                {video.owner?.username} • {video.views} views
              </p>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                onClick={() => handleRemoveVideo(video._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {playlist.videos.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            This playlist has no videos.
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaylistDetail;

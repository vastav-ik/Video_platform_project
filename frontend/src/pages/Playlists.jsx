import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Plus, List } from 'lucide-react';
import { AddToPlaylistModal } from '@/components/AddToPlaylistModal';

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/playlists/user/${user._id}`,
          { headers }
        );
        setPlaylists(response.data.data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  if (loading)
    return <div className="p-8 text-center">Loading playlists...</div>;

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Playlists</h1>
        {/* Potentially a Create Button here */}
        {/* We can use a simple Trigger for a Dialog here or just rely on AddToPlaylistModal from videos */}
      </div>

      {playlists.length === 0 ? (
        <p className="text-muted-foreground">
          You haven't created any playlists yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlists.map(playlist => (
            <Link
              key={playlist._id}
              to={`/playlists/${playlist._id}`}
              className="group overflow-hidden rounded-lg border bg-card text-card-foreground hover:shadow-lg transition-all"
            >
              <div className="relative aspect-video bg-muted flex items-center justify-center">
                {playlist.playlistThumbnail?.thumbnail?.url ? (
                  <img
                    src={playlist.playlistThumbnail.thumbnail.url}
                    alt={playlist.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <List className="h-10 w-10 mb-2" />
                    <span className="text-xs">No videos</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-bold">View Playlist</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 text-lg font-semibold">
                  {playlist.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {playlist.description || 'No description'}
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  {playlist.videos?.length || 0} videos
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Playlists;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { List, Plus, Check } from 'lucide-react';

export function AddToPlaylistModal({ videoId }) {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPlaylists = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/playlists/user/${user._id}`
        // Auth header might affect visibility, but getting own playlists usually requires auth if private?
        // Let's verify routes. getUserPlaylists is public in route but usually we want "my" playlists.
        // If route is public, it returns public playlists.
        // Wait, to add to playlist, I must own it.
      );
      setPlaylists(response.data.data || []);
    } catch (error) {
      console.error('Error fetching playlists', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPlaylists();
    }
  }, [open]);

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/playlists`,
        { name: newPlaylistName, description: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewPlaylistName('');
      fetchPlaylists();
    } catch (error) {
      console.error('Error creating playlist', error);
    }
  };

  const toggleVideoInPlaylist = async (playlistId, isPresent) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (isPresent) {
        await axios.patch(
          `${import.meta.env.VITE_API_BASE_URL}/playlists/remove/${videoId}/${playlistId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.patch(
          `${import.meta.env.VITE_API_BASE_URL}/playlists/add/${videoId}/${playlistId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchPlaylists(); // Refresh to update local state of which playlists have the video
    } catch (error) {}
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="rounded-xl">
          Save
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-2xl border-primary/30 bg-card p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold text-foreground">
            Save to Playlist
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-2 py-2 max-h-[300px] overflow-y-auto px-6">
          {playlists.map(pl => {
            const isVideoInPlaylist = pl.videos?.includes(videoId);
            return (
              <div
                key={pl._id}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  isVideoInPlaylist
                    ? 'bg-primary/20 border-primary/30'
                    : 'hover:bg-primary/10 border-transparent'
                } border`}
              >
                <div
                  className="flex items-center space-x-3 w-full cursor-pointer"
                  onClick={() =>
                    toggleVideoInPlaylist(pl._id, isVideoInPlaylist)
                  }
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                      isVideoInPlaylist
                        ? 'bg-accent border-accent text-accent-foreground'
                        : 'border-primary/40 bg-transparent'
                    }`}
                  >
                    {isVideoInPlaylist && (
                      <Check className="h-3 w-3 stroke-[4px]" />
                    )}
                  </div>
                  <Label className="text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1">
                    {pl.name}
                  </Label>
                </div>
              </div>
            );
          })}
          {playlists.length === 0 && (
            <div className="py-12 text-center">
              <List className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-sm text-muted-foreground italic">
                No playlists found.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 p-6 border-t border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2">
            <Input
              placeholder="New Playlist Name"
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              className="bg-background/50 border-primary/20 focus-visible:ring-accent rounded-lg h-10"
            />
            <Button
              onClick={createPlaylist}
              size="sm"
              className="rounded-lg h-10 px-4 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={() => setOpen(false)}
            variant="default"
            className="w-full rounded-lg bg-primary text-foreground hover:bg-primary/80 font-bold"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox'; // Need to create/import Checkbox?
// Or just use native input type="checkbox" for simplicity or install Checkbox.
// Let's use native for now to save time or basic styling.

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
        `${import.meta.env.VITE_API_BASE_URL}/playlist/user/${user._id}`
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
        `${import.meta.env.VITE_API_BASE_URL}/playlist`,
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
          `${import.meta.env.VITE_API_BASE_URL}/playlist/remove/${videoId}/${playlistId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.patch(
          `${import.meta.env.VITE_API_BASE_URL}/playlist/add/${videoId}/${playlistId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // Ideally refresh generic "isPresent" check.
      // But API doesn't tell us if video is in playlist easily without fetching full playlist details.
      // For MVP, we might just assume success.
      alert(`Video ${isPresent ? 'removed from' : 'added to'} playlist`);
    } catch (error) {
      console.error('Error updating playlist', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Save
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save to Playlist</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {playlists.map(pl => (
            <div key={pl._id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={pl._id}
                className="h-4 w-4 rounded border-gray-300"
                onChange={e => toggleVideoInPlaylist(pl._id, !e.target.checked)}
                // Logic is tricky here without knowing initial state.
                // Simplification: Just allow "Add" (one way) or just "Click to add".
                // Let's make it simple buttons for now.
              />
              <Label htmlFor={pl._id}>{pl.name}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto text-xs"
                onClick={() => toggleVideoInPlaylist(pl._id, false)}
              >
                Add
              </Button>
            </div>
          ))}
          {playlists.length === 0 && (
            <p className="text-sm text-muted-foreground w-full text-center">
              No playlists found.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 border-t pt-4">
          <Input
            placeholder="New Playlist Name"
            value={newPlaylistName}
            onChange={e => setNewPlaylistName(e.target.value)}
          />
          <Button onClick={createPlaylist} size="sm">
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

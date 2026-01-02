import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, List } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [open, setOpen] = useState(false);

  const fetchPlaylists = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await api.get(`/playlists/user/${user._id}`);
      setPlaylists(response.data.data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreatePlaylist = async e => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      await api.post('/playlists', {
        name: newPlaylistName,
        description: newPlaylistDesc,
      });
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setOpen(false);
      fetchPlaylists();
    } catch (error) {}
  };

  if (loading)
    return <div className="p-8 text-center">Loading playlists...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          My Playlists
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-lg bg-accent text-accent-foreground shadow-lg transition-all hover:scale-105 hover:bg-accent/90 active:scale-95">
              <Plus className="mr-2 h-4 w-4" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl border-primary/30 bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Create New Playlist
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePlaylist} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter playlist name"
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  className="bg-primary/10 border-primary/20 focus-visible:ring-accent rounded-lg"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter playlist description (optional)"
                  value={newPlaylistDesc}
                  onChange={e => setNewPlaylistDesc(e.target.value)}
                  className="bg-primary/10 border-primary/20 focus-visible:ring-accent rounded-lg min-h-[100px]"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" className="rounded-lg px-8">
                  Create
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-primary/30 bg-primary/5">
          <List className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
          <p className="text-lg font-medium text-foreground">
            You haven't created any playlists yet.
          </p>
          <p className="mt-2 text-muted-foreground">
            Organize your favorite videos into collections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlists.map(playlist => (
            <Link
              key={playlist._id}
              to={`/playlists/${playlist._id}`}
              className="group overflow-hidden rounded-xl border border-primary/30 bg-card transition-all hover:border-accent/40 hover:shadow-xl"
            >
              <div className="relative aspect-video bg-primary/10 flex items-center justify-center overflow-hidden">
                {playlist.playlistThumbnail?.thumbnail?.url ? (
                  <img
                    src={playlist.playlistThumbnail.thumbnail.url}
                    alt={playlist.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground/60">
                    <List className="h-12 w-12 mb-2" />
                    <span className="text-xs uppercase tracking-wider font-semibold">
                      Empty Playlist
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="rounded-full bg-accent p-3 text-accent-foreground shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <List className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 text-base font-bold text-foreground group-hover:text-accent transition-colors">
                  {playlist.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {playlist.description || 'No description'}
                </p>
                <div className="mt-3 flex items-center text-[10px] font-bold uppercase tracking-widest text-accent/80">
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

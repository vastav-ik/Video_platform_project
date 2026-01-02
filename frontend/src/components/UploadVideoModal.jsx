import React, { useState } from 'react';
import api from '@/lib/api';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';

export function UploadVideoModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    thumbnail: null,
    status: 'public',
  });

  const handleChange = e => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      await api.post('/videos', data);
      toast.success('Video published!');
      setOpen(false);
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Publishing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full font-bold px-6 shadow-lg hover:scale-105 active:scale-95 transition-all">
          Upload Video
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-primary/20 bg-card p-0 shadow-2xl">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-2xl font-black tracking-tight">
            Post Content
          </DialogTitle>
        </DialogHeader>
        <div className="px-8 pb-8">
          {error && (
            <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-xs font-bold text-destructive border border-destructive/20">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label
                htmlFor="title"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
              >
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="rounded-xl bg-muted/50 border-primary/10 h-12"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="description"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
              >
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="rounded-xl bg-muted/50 border-primary/10 min-h-[100px]"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="status"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
              >
                Visibility
              </Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="rounded-xl bg-muted/50 border-primary/10 h-12 px-4 text-sm font-bold appearance-none"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
                <option value="members-only">Members Only</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="videoFile"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                >
                  Video
                </Label>
                <Input
                  id="videoFile"
                  name="videoFile"
                  type="file"
                  accept="video/*"
                  onChange={handleChange}
                  className="h-12 file:bg-primary file:rounded-lg file:border-0 file:text-xs file:font-bold cursor-pointer"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="thumbnail"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                >
                  Thumbnail
                </Label>
                <Input
                  id="thumbnail"
                  name="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="h-12 file:bg-primary file:rounded-lg file:border-0 file:text-xs file:font-bold cursor-pointer"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Processing...' : 'Publish'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

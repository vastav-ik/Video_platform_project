import React, { useState } from 'react';
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
  });

  const handleChange = e => {
    if (e.target.files) {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    if (formData.videoFile) data.append('videoFile', formData.videoFile);
    if (formData.thumbnail) data.append('thumbnail', formData.thumbnail);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Not authenticated');

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/videos`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('Video uploaded successfully!');
      setOpen(false);
      // Ideally trigger a refresh in parent, but for now just close
      window.location.reload(); // Simple refresh to show new video
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Upload Video</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] rounded-2xl border-primary/30 bg-card p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold text-foreground">
            Upload New Video
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label
                htmlFor="title"
                className="text-sm font-semibold text-foreground/80"
              >
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Give your video a catchy title"
                className="bg-primary/10 border-primary/20 focus-visible:ring-accent rounded-lg"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="description"
                className="text-sm font-semibold text-foreground/80"
              >
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What is your video about?"
                className="bg-primary/10 border-primary/20 focus-visible:ring-accent rounded-lg min-h-[100px]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="videoFile"
                  className="text-sm font-semibold text-foreground/80"
                >
                  Video File
                </Label>
                <div className="relative group cursor-pointer">
                  <Input
                    id="videoFile"
                    name="videoFile"
                    type="file"
                    accept="video/*"
                    onChange={handleChange}
                    className="cursor-pointer file:cursor-pointer bg-primary/10 border-primary/20 focus-visible:ring-accent rounded-lg h-12 py-2 file:mr-2 file:py-0 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-foreground"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="thumbnail"
                  className="text-sm font-semibold text-foreground/80"
                >
                  Thumbnail
                </Label>
                <Input
                  id="thumbnail"
                  name="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="cursor-pointer file:cursor-pointer bg-primary/10 border-primary/20 focus-visible:ring-accent rounded-lg h-12 py-2 file:mr-2 file:py-0 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-foreground"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-accent text-accent-foreground font-bold h-11 shadow-lg transition-all hover:scale-[1.02] hover:bg-accent/90 active:scale-[0.98]"
            >
              {loading ? 'Uploading...' : 'Publish Video'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

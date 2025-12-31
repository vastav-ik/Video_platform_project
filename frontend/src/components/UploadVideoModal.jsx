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

      console.log('Upload success:', response.data);
      setOpen(false);
      // Ideally trigger a refresh in parent, but for now just close
      window.location.reload(); // Simple refresh to show new video
    } catch (err) {
      console.error('Upload Error', err);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload New Video</DialogTitle>
        </DialogHeader>
        {error && <div className="text-sm text-red-500">{error}</div>}
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="videoFile">Video File</Label>
            <Input
              id="videoFile"
              name="videoFile"
              type="file"
              accept="video/*"
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="thumbnail">Thumbnail</Label>
            <Input
              id="thumbnail"
              name="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Publish Video'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

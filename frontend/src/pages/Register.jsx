import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    avatar: null,
    coverImage: null,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

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

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/register`,
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8 rounded-3xl bg-card p-10 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
        <div className="space-y-3 text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight">
            Create Account
          </h1>
          <p className="text-muted-foreground text-lg">
            Join us and start sharing your videos
          </p>
        </div>
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500 dark:bg-red-950/50">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label
              className="text-sm font-semibold tracking-wide text-foreground/80"
              htmlFor="fullName"
            >
              Full Name
            </label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="e.g. John Doe"
              onChange={handleChange}
              required
              className="h-12 rounded-xl bg-muted/30 px-4 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label
                className="text-sm font-semibold tracking-wide text-foreground/80"
                htmlFor="username"
              >
                Username
              </label>
              <Input
                id="username"
                name="username"
                placeholder="e.g. johndoe"
                onChange={handleChange}
                required
                className="h-12 rounded-xl bg-muted/30 px-4 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-3">
              <label
                className="text-sm font-semibold tracking-wide text-foreground/80"
                htmlFor="email"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="e.g. m@example.com"
                onChange={handleChange}
                required
                className="h-12 rounded-xl bg-muted/30 px-4 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label
              className="text-sm font-semibold tracking-wide text-foreground/80"
              htmlFor="password"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              name="password"
              onChange={handleChange}
              required
              className="h-12 rounded-xl bg-muted/30 px-4 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label
                className="text-sm font-semibold tracking-wide text-foreground/80"
                htmlFor="avatar"
              >
                Avatar
              </label>
              <div className="relative">
                <Input
                  id="avatar"
                  type="file"
                  name="avatar"
                  onChange={handleChange}
                  required
                  className="h-12 w-full cursor-pointer rounded-xl bg-muted/30 pt-2.5 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label
                className="text-sm font-semibold tracking-wide text-foreground/80"
                htmlFor="coverImage"
              >
                Cover Image
              </label>
              <div className="relative">
                <Input
                  id="coverImage"
                  type="file"
                  name="coverImage"
                  onChange={handleChange}
                  className="h-12 w-full cursor-pointer rounded-xl bg-muted/30 pt-2.5 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-xl text-lg font-medium shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Register
          </Button>
        </form>
        <div className="pt-2 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;

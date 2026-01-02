import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';

import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/login`,
        formData
      );
      const { accessToken, refreshToken, user } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      dispatch(login(user));
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-card p-10 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
        <div className="space-y-3 text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-lg">
            Enter your credentials to access your account
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
              htmlFor="username"
            >
              Username or Email
            </label>
            <Input
              id="username"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
              className="h-12 rounded-xl bg-muted/30 px-4 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
            />
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
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="h-12 rounded-xl bg-muted/30 px-4 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-xl text-lg font-medium shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign In
          </Button>
        </form>
        <div className="pt-2 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

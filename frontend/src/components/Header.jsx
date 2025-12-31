import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Video, LogOut, Search } from 'lucide-react';
import axios from 'axios';

function Header() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/users/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full px-6 pt-6">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-2xl border border-white/20 bg-white/60 px-6 backdrop-blur-md shadow-sm transition-all hover:bg-white/70 hover:shadow-md dark:border-white/10 dark:bg-black/40">
        <Link
          to="/"
          className="flex items-center space-x-3 transition-opacity hover:opacity-80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg">
            <Video className="h-5 w-5" />
          </div>
          <span className="hidden font-heading text-lg font-bold tracking-tight text-foreground sm:inline-block">
            Vidtube
          </span>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md mx-6 relative"
        >
          <Input
            type="text"
            placeholder="Search videos..."
            className="w-full pl-10 bg-white/50 border-white/20 focus:bg-white transition-all rounded-xl"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </form>

        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/cards"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Cards
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center space-x-3 border-l border-border/50 pl-6">
            {user ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex text-muted-foreground hover:text-foreground"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="rounded-xl px-5 shadow-lg transition-transform hover:scale-105 active:scale-95"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

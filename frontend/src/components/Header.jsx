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
    <header className="sticky top-0 z-50 w-full px-4 py-4">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-xl border border-primary/50 bg-background/80 px-6 backdrop-blur-xl shadow-2xl transition-all hover:border-accent/40">
        <Link
          to="/"
          className="flex items-center space-x-2 transition-transform hover:scale-105"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-foreground shadow-md">
            <Video className="h-5 w-5" />
          </div>
          <span className="hidden font-heading text-xl font-bold tracking-tight text-foreground sm:inline-block">
            Vidtube
          </span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-lg mx-8 relative"
        >
          <Input
            type="text"
            placeholder="Search videos..."
            className="w-full pl-10 bg-primary/20 border-primary/30 text-foreground placeholder:text-muted-foreground focus:bg-primary/30 transition-all rounded-lg focus-visible:ring-accent"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </form>

        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/playlists"
              className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-accent rounded-md hover:bg-primary/20"
            >
              Playlists
            </Link>
            <Link
              to="/cards"
              className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-accent rounded-md hover:bg-primary/20"
            >
              Cards
            </Link>
            <Link
              to="/dashboard"
              className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-accent rounded-md hover:bg-primary/20"
            >
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center space-x-3 border-l border-primary/30 pl-4">
            {user ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
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
                    className="rounded-lg bg-accent text-accent-foreground shadow-lg transition-all hover:scale-105 hover:bg-accent/90 active:scale-95"
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

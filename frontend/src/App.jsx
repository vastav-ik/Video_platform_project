import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VideoPlayer from './pages/VideoPlayer';
import Dashboard from './pages/Dashboard';
import Cards from './pages/Cards';
import ChannelProfile from './pages/ChannelProfile';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';

function App() {
  return (
    <Router>
      <div className="relative flex min-h-screen flex-col bg-background font-sans antialiased">
        <Toaster position="top-right" richColors closeButton />
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/videos/:videoId" element={<VideoPlayer />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/c/:username" element={<ChannelProfile />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

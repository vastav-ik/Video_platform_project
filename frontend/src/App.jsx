import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VideoPlayer from './pages/VideoPlayer';
import Dashboard from './pages/Dashboard';
import Cards from './pages/Cards';

function App() {
  return (
    <Router>
      <div className="relative flex min-h-screen flex-col bg-background font-sans antialiased">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/videos/:videoId" element={<VideoPlayer />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cards" element={<Cards />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

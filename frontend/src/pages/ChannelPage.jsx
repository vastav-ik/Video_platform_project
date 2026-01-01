import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoCard from '../components/VideoCard';
import { Card } from '../components/Card';
import PlaylistCard from '../components/PlaylistCard';

const ChannelPage = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/users/c/${username}`
        );
        setChannel(res.data.data);

        const videoRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/videos?userId=${res.data.data._id}`
        );
        setVideos(videoRes.data.data?.docs || []);

        const playlistRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/playlist/user/${res.data.data._id}`
        );
        setPlaylists(playlistRes.data.data || []);

        const cardRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/cards/user/${res.data.data._id}`
        );
        setCards(cardRes.data.data?.docs || []);
      } catch (error) {
        console.error('Failed to fetch channel data', error);
      }
    };
    fetchChannelData();
  }, [username]);

  const handleToggleMembership = async () => {
    if (!channel) return;
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return alert('Please login to join');

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/subscriptions/c/${channel._id}/membership`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChannel(prev => ({ ...prev, isMember: response.data.data.isMember }));
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update membership');
    }
  };

  if (!channel)
    return <div className="text-center mt-20 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-purple-800 to-blue-900 overflow-hidden relative">
        {channel.coverImage && (
          <img
            src={channel.coverImage.url}
            alt="Cover"
            className="w-full h-full object-cover opacity-70"
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <img
            src={channel.avatar?.url}
            alt={channel.username}
            className="w-32 h-32 rounded-full border-4 border-background object-cover shadow-2xl"
          />
          <div className="mb-2">
            <h1 className="text-3xl font-bold font-heading">
              {channel.fullName}
            </h1>
            <p className="text-muted-foreground">
              @{channel.username} • {channel.subscribersCount} subscribers
            </p>
          </div>
          <div className="ml-auto mb-4 flex gap-3">
            {channel.isMember ? (
              <button
                onClick={handleToggleMembership}
                className="bg-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-500/20"
              >
                Member
              </button>
            ) : (
              <button
                onClick={handleToggleMembership}
                className="bg-transparent border-2 border-purple-500 text-purple-400 px-6 py-2 rounded-full font-semibold hover:bg-purple-500/10 transition"
              >
                Join
              </button>
            )}
            <button className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="bg-transparent border-b border-gray-700 w-full justify-start rounded-none p-0 h-auto">
            <TabsTrigger
              value="videos"
              className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all"
            >
              Videos
            </TabsTrigger>
            <TabsTrigger
              value="community"
              className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all"
            >
              Community
            </TabsTrigger>
            <TabsTrigger
              value="playlists"
              className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all"
            >
              Playlists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Uploads</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos?.map(video => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
            {(!videos || videos.length === 0) && (
              <p className="text-gray-500">No videos uploaded yet.</p>
            )}
          </TabsContent>

          <TabsContent value="community" className="mt-6 max-w-2xl">
            <div className="space-y-6">
              {cards?.map(card => (
                <Card key={card._id} card={card} />
              ))}
            </div>
            {(!cards || cards.length === 0) && (
              <p className="text-gray-500">No community posts yet.</p>
            )}
          </TabsContent>

          <TabsContent value="playlists" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {playlists?.map(playlist => (
                <PlaylistCard key={playlist._id} playlist={playlist} />
              ))}
            </div>
            {(!playlists || playlists.length === 0) && (
              <p className="text-gray-500">No public playlists.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChannelPage;

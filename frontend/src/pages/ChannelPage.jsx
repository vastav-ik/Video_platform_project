import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoCard from '../components/VideoCard';
import { Card } from '../components/Card';
import PlaylistCard from '../components/PlaylistCard';
import { toast } from '@/lib/toast';

const ChannelPage = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [cards, setCards] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) setCurrentUser(JSON.parse(user));
  }, []);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const res = await api.get(`/users/c/${username}`);
        const channelData = res.data.data;
        setChannel(channelData);
        setIsSubscribed(channelData.isSubscribed || false);

        const [videoRes, playlistRes, cardRes] = await Promise.all([
          api.get(`/videos?userId=${channelData._id}`),
          api.get(`/playlists/user/${channelData._id}`),
          api.get(`/cards/user/${channelData._id}`),
        ]);

        setVideos(videoRes.data.data?.docs || []);
        setPlaylists(playlistRes.data.data || []);
        setCards(cardRes.data.data?.docs || []);
      } catch (error) {
        toast.error('Failed to load channel data');
      }
    };
    fetchChannelData();
  }, [username]);

  const handleSubscribe = async () => {
    if (!channel) return;
    try {
      await api.post(`/subscriptions/c/${channel._id}`);
      setIsSubscribed(prev => !prev);
      setChannel(prev => ({
        ...prev,
        subscribersCount: !isSubscribed
          ? prev.subscribersCount + 1
          : prev.subscribersCount - 1,
      }));
      toast.success(isSubscribed ? 'Unsubscribed' : 'Subscribed');
    } catch (error) {
      toast.error('Subscription update failed');
    }
  };

  const handleToggleMembership = async () => {
    if (!channel) return;
    try {
      const response = await api.post(
        `/subscriptions/c/${channel._id}/membership`
      );
      setChannel(prev => ({ ...prev, isMember: response.data.data.isMember }));
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Membership update failed');
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
            {currentUser?._id !== channel._id && (
              <>
                <button
                  onClick={handleToggleMembership}
                  className={`${
                    channel.isMember
                      ? 'bg-purple-600'
                      : 'bg-transparent border-2 border-purple-500 text-purple-400'
                  } text-white px-6 py-2 rounded-full font-semibold hover:opacity-90 transition shadow-lg shadow-purple-500/20`}
                >
                  {channel.isMember ? 'Member' : 'Join'}
                </button>
                <button
                  onClick={handleSubscribe}
                  className={`${
                    isSubscribed ? 'bg-gray-600' : 'bg-white text-black'
                  } px-6 py-2 rounded-full font-semibold hover:opacity-90 transition`}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="bg-transparent border-b border-gray-700 w-full justify-start rounded-none p-0 h-auto">
            <TabsTrigger
              value="videos"
              className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all"
            >
              Videos
            </TabsTrigger>
            <TabsTrigger
              value="community"
              className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all"
            >
              Community
            </TabsTrigger>
            <TabsTrigger
              value="playlists"
              className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all"
            >
              Playlists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-6">
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

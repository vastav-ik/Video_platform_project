import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { List } from 'lucide-react';
import { Link } from 'react-router-dom';

function ChannelProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const profileRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/users/c/${username}`,
          { headers }
        );
        const profileData = profileRes.data.data;
        setProfile(profileData);
        setIsSubscribed(profileData.isSubscribed);
        setSubscribersCount(profileData.subscribersCount);

        if (profileData._id) {
          const videosRes = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/videos`,
            { params: { userId: profileData._id, limit: 50 } }
          );
          setVideos(videosRes.data.data.docs || []);

          const playlistsRes = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/playlists/user/${profileData._id}`,
            { headers }
          );
          setPlaylists(playlistsRes.data.data || []);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [username]);

  const handleSubscribe = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return alert('Please login to subscribe');
      if (!profile?._id) return;

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/subscriptions/c/${profile._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSubscribed(prev => !prev);
      setSubscribersCount(prev => (isSubscribed ? prev - 1 : prev + 1));
    } catch (error) {}
  };

  if (loading) return <div className="p-8 text-center">Loading Channel...</div>;
  if (!profile) return <div className="p-8 text-center">Channel not found</div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="h-48 md:h-64 w-full bg-muted relative overflow-hidden">
        {profile.coverImage?.url ? (
          <img
            src={profile.coverImage.url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/5 flex items-center justify-center text-muted-foreground">
            No Cover Image
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 -mt-12 md:-mt-16 relative z-10">
          <div className="h-32 w-32 rounded-full border-4 border-background bg-muted overflow-hidden shrink-0 shadow-lg">
            {profile.avatar?.url ? (
              <img
                src={profile.avatar.url}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-2xl font-bold">
                {profile.username[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left mt-2 md:mt-12">
            <h1 className="text-3xl font-bold font-heading">
              {profile.fullName}
            </h1>
            <p className="text-muted-foreground">
              @{profile.username} • {subscribersCount} subscribers •{' '}
              {profile.channelsSubscribedToCount || 0} subscribed
            </p>
          </div>

          <div className="mt-4 md:mt-12">
            <Button
              onClick={handleSubscribe}
              variant={isSubscribed ? 'secondary' : 'default'}
              className="rounded-full px-6"
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <div className="border-b border-border">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('videos')}
                className={`pb-3 px-2 font-semibold transition-colors ${
                  activeTab === 'videos'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Videos
              </button>
              <button
                onClick={() => setActiveTab('playlists')}
                className={`pb-3 px-2 font-semibold transition-colors ${
                  activeTab === 'playlists'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Playlists
              </button>
            </div>
          </div>

          <div className="mt-6">
            {activeTab === 'videos' && (
              <>
                {videos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map(video => (
                      <Link
                        to={`/videos/${video._id}`}
                        key={video._id}
                        className="group"
                      >
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                          {video.thumbnail?.url && (
                            <img
                              src={video.thumbnail.url}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          )}
                        </div>
                        <div className="mt-3">
                          <h3 className="font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                            {video.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {video.views} views •{' '}
                            {new Date(video.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No videos available.
                  </div>
                )}
              </>
            )}

            {activeTab === 'playlists' && (
              <>
                {playlists.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {playlists.map(playlist => (
                      <div
                        key={playlist._id}
                        className="group border rounded-lg p-4 hover:border-primary transition-colors"
                      >
                        <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center relative overflow-hidden">
                          {playlist.playlistThumbnail?.thumbnail?.url ? (
                            <img
                              src={playlist.playlistThumbnail.thumbnail.url}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <List className="h-8 w-8 text-muted-foreground" />
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white font-bold">
                              View Playlist
                            </p>
                          </div>
                        </div>
                        <h3 className="font-bold">{playlist.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {playlist.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No playlists created.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChannelProfile;

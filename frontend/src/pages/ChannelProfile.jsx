import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { List, Search } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      <div className="relative h-48 w-full overflow-hidden bg-primary/20 md:h-80">
        {profile.coverImage?.url ? (
          <img
            src={profile.coverImage.url}
            alt="Cover"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-background text-muted-foreground">
            <div className="text-center">
              <div className="inline-block rounded-full bg-primary/20 p-4 mb-2">
                <Search className="h-8 w-8 opacity-20" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-50">
                No Cover Image
              </p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="relative z-10 -mt-20 flex flex-col items-center gap-6 md:-mt-24 md:flex-row md:items-start">
          <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-background bg-card shadow-2xl transition-transform hover:scale-105 md:h-40 md:w-40">
            {profile.avatar?.url ? (
              <img
                src={profile.avatar.url}
                alt={profile.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-3xl font-bold text-foreground">
                {profile.username[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 text-center mt-4 md:mt-24 md:text-left">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {profile.fullName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground md:justify-start font-medium">
              <span className="text-accent font-bold">@{profile.username}</span>
              <span className="opacity-40">•</span>
              <span>{subscribersCount.toLocaleString()} subscribers</span>
              <span className="opacity-40">•</span>
              <span>{profile.channelsSubscribedToCount || 0} subscribed</span>
            </div>
          </div>

          <div className="mt-6 md:mt-24">
            <Button
              onClick={handleSubscribe}
              className={`rounded-full px-8 py-6 font-bold shadow-lg transition-all hover:scale-105 active:scale-95 ${
                isSubscribed
                  ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  : 'bg-foreground text-background hover:bg-foreground/90'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <div className="mb-8 flex items-center gap-6 border-b border-primary/20">
            {[
              { id: 'videos', label: 'Videos' },
              { id: 'playlists', label: 'Playlists' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-4 text-sm font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'text-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-accent shadow-[0_0_10px_rgba(95,149,152,0.8)]" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'videos' && (
              <>
                {videos.length > 0 ? (
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {videos.map(video => (
                      <VideoCard
                        key={video._id}
                        video={{ ...video, owner: profile }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                    <Video className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">
                      No videos uploaded yet.
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'playlists' && (
              <>
                {playlists.length > 0 ? (
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {playlists.map(playlist => (
                      <Link
                        key={playlist._id}
                        to={`/playlists/${playlist._id}`}
                        className="group overflow-hidden rounded-xl border border-primary/30 bg-card transition-all hover:border-accent/40 hover:shadow-xl"
                      >
                        <div className="relative aspect-video bg-primary/10 flex items-center justify-center overflow-hidden">
                          {playlist.playlistThumbnail?.thumbnail?.url ? (
                            <img
                              src={playlist.playlistThumbnail.thumbnail.url}
                              alt={playlist.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex flex-col items-center text-muted-foreground/60">
                              <List className="h-12 w-12 mb-2" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="rounded-full bg-accent p-3 text-accent-foreground shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              <List className="h-6 w-6" />
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="line-clamp-1 font-bold text-foreground group-hover:text-accent transition-colors">
                            {playlist.name}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {playlist.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                    <List className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">
                      No playlists created yet.
                    </p>
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

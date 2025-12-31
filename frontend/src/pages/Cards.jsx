import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

function Cards() {
  const [cards, setCards] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [subscribedChannels, setSubscribedChannels] = useState(new Set());
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchCards = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/cards`
      );
      setCards(response.data.data?.docs || response.data.data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    if (!user?._id) return;
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/subscriptions/u/${user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const subs = response.data.data || [];
      const channelIds = new Set(
        subs.map(sub => sub.channel?._id || sub.channel)
      );
      setSubscribedChannels(channelIds);
    } catch (error) {}
  };

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return alert('Please login to post');

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/cards`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent('');
      fetchCards();
    } catch (error) {
      alert('Failed to post');
    }
  };

  const filteredCards = cards.filter(card => {
    if (activeTab === 'all') return true;
    if (activeTab === 'subscribed') {
      const authorId = card.author?._id || card.author;
      return subscribedChannels.has(authorId);
    }
    return true;
  });

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container max-w-2xl py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Cards</h1>
        {user && (
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className="rounded-md"
            >
              All Posts
            </Button>
            <Button
              variant={activeTab === 'subscribed' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('subscribed')}
              className="rounded-md"
            >
              Subscribed
            </Button>
          </div>
        )}
      </div>

      <div className="mb-8 rounded-2xl border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit}>
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="mb-4 min-h-[100px] bg-muted/20 resize-none border-0 focus-visible:ring-1"
            required
          />
          <div className="flex justify-end">
            <Button type="submit" className="rounded-xl px-6">
              Post Update
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {filteredCards.map(card => (
          <div
            key={card._id}
            className="rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                {card.author?.avatar?.url && (
                  <img
                    src={card.author.avatar.url}
                    alt={card.author.username}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {card.author?.username || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(card.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
              {card.content}
            </p>
          </div>
        ))}
        {filteredCards.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No updates found.</p>
            {activeTab === 'subscribed' && (
              <p className="text-sm text-muted-foreground mt-2">
                Try subscribing to some channels!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Cards;

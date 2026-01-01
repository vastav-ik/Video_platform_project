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
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
            Community Cards
          </h1>
          <p className="mt-2 text-muted-foreground">
            Share your thoughts and updates with the community.
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-1 rounded-2xl border border-primary/20 bg-card/50 p-1.5 shadow-inner backdrop-blur-sm">
            <Button
              variant={activeTab === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className={`rounded-xl px-4 font-bold transition-all ${
                activeTab === 'all' ? 'shadow-md' : ''
              }`}
            >
              All Posts
            </Button>
            <Button
              variant={activeTab === 'subscribed' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('subscribed')}
              className={`rounded-xl px-4 font-bold transition-all ${
                activeTab === 'subscribed' ? 'shadow-md' : ''
              }`}
            >
              Following
            </Button>
          </div>
        )}
      </div>

      <div className="mb-12 rounded-3xl border border-primary/20 bg-gradient-to-br from-card to-muted/20 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">Write a Card</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <Textarea
            placeholder="What's spinning in your head?"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="mb-6 min-h-[140px] rounded-2xl border-primary/10 bg-muted/30 p-4 text-lg ring-offset-background placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all resize-none"
            required
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              className="h-12 rounded-2xl bg-primary px-8 font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            >
              Post Update
            </Button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {filteredCards.map(card => (
          <div
            key={card._id}
            className="group relative flex flex-col rounded-3xl border border-primary/10 bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl"
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-muted p-0.5 shadow-md ring-2 ring-primary/10 transition-all group-hover:ring-primary/30">
                {card.author?.avatar?.url ? (
                  <img
                    src={card.author.avatar.url}
                    alt={card.author.username}
                    className="h-full w-full rounded-[14px] object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/5 text-xl font-bold text-primary">
                    {card.author?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div>
                <p className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {card.author?.username || 'Anonymous'}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  {new Date(card.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
            <div className="relative flex-1">
              <span className="absolute -left-2 -top-2 scale-150 text-4xl opacity-5">
                "
              </span>
              <p className="relative z-10 whitespace-pre-wrap text-lg leading-relaxed text-foreground/80 group-hover:text-foreground transition-colors">
                {card.content}
              </p>
            </div>
            <div className="mt-8 flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors cursor-pointer">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-primary/20 py-24 text-center">
          <div className="mb-6 rounded-full bg-primary/5 p-8">
            <svg
              className="h-12 w-12 text-primary/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-2xl font-black text-foreground/40">No Cards Yet</p>
          <p className="mt-2 max-w-sm text-muted-foreground">
            {activeTab === 'subscribed'
              ? "Follow some creators to see their updates here, or switch to 'All Posts'."
              : 'Be the first one to share an update with the community!'}
          </p>
        </div>
      )}
    </div>
  );
}

export default Cards;

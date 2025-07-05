"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Badge } from "@/components/ui/badge";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";

interface Pill {
  id: string;
  title: string;
  description?: string;
  content?: string;
  url?: string;
  urlToImage?: string;
  publishedAt?: string;
  source?: string;
  created_at?: string;
}

export default function QuickPostPage() {
  const [name, setName] = useState<string>("");
  const [pills, setPills] = useState<Pill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPill, setSelectedPill] = useState<Pill | null>(null);
  const [tweet, setTweet] = useState<string>("");
  const [tweetLoading, setTweetLoading] = useState(false);
  const [tweetError, setTweetError] = useState<string | null>(null);
  const [tweetPosted, setTweetPosted] = useState(false);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // Fetch user display name
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const displayName = data.user?.user_metadata?.display_name;
      setName(displayName || "there");
    });
  }, []);

  // Fetch pills
  const fetchPills = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/quick-posts");
      const data = await res.json();
      setPills(data.pills || []);
      if (data.pills && data.pills.length > 0) {
        const latest = data.pills[0].created_at || data.pills[0].publishedAt;
        setLastFetched(latest ? new Date(latest + 'Z') : null);
      } else {
        setLastFetched(null);
      }
    } catch {
      setError("Failed to fetch pills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scrape news
  const handleScrape = async () => {
    setScrapeLoading(true);
    setError(null);
    try {
      await fetch("/api/v1/quick-posts", { method: "POST" });
      await fetchPills();
    } catch {
      setError("Failed to fetch news");
    } finally {
      setScrapeLoading(false);
    }
  };

  // Generate tweet
  const handlePillClick = async (pill: Pill) => {
    setSelectedPill(pill);
    setTweet("");
    setTweetError(null);
    setTweetLoading(true);
    setTweetPosted(false);
    try {
      const res = await fetch("/api/v1/quick-post/generate-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pill }),
      });
      const data = await res.json();
      if (data.tweet) {
        setTweet(data.tweet);
      } else {
        setTweetError("Failed to generate tweet");
      }
    } catch {
      setTweetError("Failed to generate tweet");
    } finally {
      setTweetLoading(false);
    }
  };

  // Post tweet
  const handlePostTweet = async () => {
    setTweetLoading(true);
    setTweetError(null);
    try {
      const res = await fetch("/api/v1/quick-post/post-to-twitter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweet }),
      });
      const data = await res.json();
      if (data.tweet) {
        setTweetPosted(true);
      } else {
        setTweetError("Failed to post tweet");
      }
    } catch {
      setTweetError("Failed to post tweet");
    } finally {
      setTweetLoading(false);
    }
  };

  // Check if scrape is needed
  const needsScrape =
    !pills.length ||
    (lastFetched && Date.now() - lastFetched.getTime() > 12 * 60 * 60 * 1000);

  return (
    <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Quick Post" />
    <div className="max-w-xl mx-auto py-10 px-4 flex flex-col items-center justify-center h-full">
      <h1 className="text-5xl mb-2">Hello, {name}!</h1>
      <h3 className="text-gray-500 mb-8">What tweet are we posting today?</h3>
      <div className="mb-4 flex items-center gap-4">
        {needsScrape && (
          <button
            className="bg-primary text-primary-foreground rounded px-4 py-2 font-semibold disabled:opacity-50"
            onClick={handleScrape}
            disabled={scrapeLoading || loading}
          >
            {loading?"Loading...":scrapeLoading ? "Fetching..." : "Fetch Latest News"}
          </button>
        )}
        {error && <span className="text-red-600">{error}</span>}
        {/* Show last scraped time if scrape is not needed */}
        {!needsScrape && lastFetched && (
          <span className="text-xs text-gray-400 ml-2">Last scraped: {lastFetched.toLocaleString()}</span>
        )}
      </div>
      <div className="relative h-80 w-full overflow-hidden flex flex-col items-center justify-center mb-8">
        <div
          className="flex flex-col justify-center items-center gap-2 animate-scroll-vertical"
          style={{ height: 'auto', minHeight: '200%', willChange: 'transform' }}
          onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
          onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
        >
          {[...pills, ...pills].map((pill, idx) => (
            <Badge
              key={pill.id + '-' + idx}
              className="cursor-pointer bg-primary/10 border-primary/50 text-gray-800 text-[12px] px-2 py-1 transition-transform hover:scale-105"
              onClick={() => handlePillClick(pill)}
            >
              {pill.title.length > 50 ? pill.title.slice(0, 50) + '...' : pill.title}
            </Badge>
          ))}
        </div>
        {/* Gradient mask for top/bottom fade */}
        <div className="pointer-events-none absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-[#fffcf4]/95 to-transparent z-10" />
<div className="pointer-events-none absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#fffcf4]/95 to-transparent z-10" />
      </div>
      {/* Chat UI */}
      <div className="mt-8">
        {selectedPill && (
          <div className="mb-4">
            <div className="text-gray-500 text-sm mb-1">Selected News:</div>
            <div className="bg-muted rounded p-3 mb-2">
              <div className="font-semibold">{selectedPill.title}</div>
              <div className="text-sm text-gray-600">{selectedPill.description}</div>
            </div>
          </div>
        )}
        {tweet && (
            <div className="flex flex-col items-end mb-2">
            <div className="bg-primary text-primary-foreground rounded-lg px-4 py-3 shadow chat-bubble">
              {tweet}
            </div>
            {!tweetPosted ? (
                <button
                className="mt-2 bg-green-600 text-white rounded px-4 py-1 font-semibold hover:bg-green-700"
                onClick={handlePostTweet}
                disabled={tweetLoading}
                >
                {tweetLoading ? "Posting..." : "Yes, post to Twitter"}
              </button>
            ) : (
                <div className="mt-2 text-green-600 font-semibold">Tweet posted!</div>
            )}
          </div>
        )}
        {tweetLoading && <div className="mb-2">Generating tweet...</div>}
        {tweetError && <div className="text-red-600 mb-2">{tweetError}</div>}
      </div>
    </div>
    </SidebarInset>
    </SidebarProvider>
  );
} 
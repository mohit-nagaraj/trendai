import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines?country=us';
const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWSAPI_KEY;

export async function POST() {
  if (!NEWS_API_KEY) {
    return NextResponse.json({ error: 'Missing NEWSAPI_KEY env variable' }, { status: 500 });
  }

  try {
    // Fetch news articles from NewsAPI
    const res = await fetch(`${NEWS_API_URL}&apiKey=${NEWS_API_KEY}`);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch news from NewsAPI' }, { status: 500 });
    }
    const data = await res.json();
    const articles = Array.isArray(data.articles) ? data.articles : [];

    // Transform articles to rows (title, description, content, ...)
    const rows = articles.map((article: {
      title: string;
      description: string;
      content: string;
      url: string;
      urlToImage: string;
      publishedAt: string;
      source?: { name?: string };
    }) => ({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      urltoimage: article.urlToImage,
      publishedat: article.publishedAt ? new Date(article.publishedAt) : null,
      source: article.source?.name || '',
    }));

    // Store each article as a row in quick_posts
    const supabase = await createClient();
    const { error } = await supabase
      .from('quick_posts')
      .insert(rows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ inserted: rows.length }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    // Get the 20 most recent pills/articles
    const { data, error } = await supabase
      .from('quick_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ pills: data || [] }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
} 
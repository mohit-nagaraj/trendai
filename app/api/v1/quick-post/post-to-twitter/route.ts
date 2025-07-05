import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

const appKey = process.env.NEXT_PUBLIC_TWITTER_APP_KEY;
const appSecret = process.env.NEXT_PUBLIC_TWITTER_APP_SECRET;
const accessToken = process.env.NEXT_PUBLIC_TWITTER_ACCESS_TOKEN;
const accessSecret = process.env.NEXT_PUBLIC_TWITTER_ACCESS_SECRET;

export async function POST(req: Request) {
  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    return NextResponse.json({ error: 'Missing Twitter API credentials' }, { status: 500 });
  }
  try {
    const body = await req.json();
    const tweet = body.tweet;
    if (!tweet || typeof tweet !== 'string') {
      return NextResponse.json({ error: 'Missing tweet text' }, { status: 400 });
    }
    const client = new TwitterApi({
      appKey,
      appSecret,
      accessToken,
      accessSecret,
    });
    const rwClient = client.readWrite;
    const { data } = await rwClient.v2.tweet(tweet);
    return NextResponse.json({ tweet: data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
} 
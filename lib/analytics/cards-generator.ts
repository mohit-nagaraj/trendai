import { createClient } from '@/utils/supabase/server';

interface AnalyticsCard {
  title: string;
  value: string;
  text: string;
  subtext: string;
  trend: string;
  trendicon: string;
}

interface AnalyticsCardsResponse {
  card1: AnalyticsCard;
  card2: AnalyticsCard;
  card3: AnalyticsCard;
  card4: AnalyticsCard;
}

// Helper function to format numbers with appropriate suffixes
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  } else {
    return num.toString();
  }
}

export async function generateAnalyticsCards(): Promise<AnalyticsCardsResponse> {
  const supabase = await createClient();
  
  // Get all posts data
  const { data: posts, error } = await supabase
    .from('content_posts')
    .select('*');

  if (error || !posts || posts.length === 0) {
    throw new Error(`Failed to fetch posts for analytics: ${error?.message || 'No posts found'}`);
  }

  // Get historical data for comparison (last 90 days before current batch)
  const currentBatchDate = new Date();
  const historicalStartDate = new Date(currentBatchDate.getTime() - (90 * 24 * 60 * 60 * 1000));
  
  const { data: historicalPosts } = await supabase
    .from('content_posts')
    .select('engagement_rate, likes, reach, platform, follows')
    .gte('created_at', historicalStartDate.toISOString())
    .lt('created_at', currentBatchDate.toISOString());

  // Calculate metrics
  const totalPosts = posts.length;
  const platforms = [...new Set(posts.map(p => p.platform))];
  
  // Card 1: Average Engagement Rate
  const avgEngagementRate = posts.reduce((sum, post) => sum + (post.engagement_rate || 0), 0) / totalPosts;
  const historicalAvgER = historicalPosts && historicalPosts.length > 0 
    ? historicalPosts.reduce((sum, post) => sum + (post.engagement_rate || 0), 0) / historicalPosts.length
    : avgEngagementRate;
  
  const erTrend = avgEngagementRate - historicalAvgER;
  const erTrendText = erTrend >= 0 ? `+${erTrend.toFixed(1)}% vs previous period` : `${erTrend.toFixed(1)}% vs previous period`;
  
  // Find which platform/content type drove engagement
  const platformEngagement = platforms.map(platform => {
    const platformPosts = posts.filter(p => p.platform === platform);
    const avgER = platformPosts.reduce((sum, post) => sum + (post.engagement_rate || 0), 0) / platformPosts.length;
    return { platform, avgER, count: platformPosts.length };
  }).sort((a, b) => b.avgER - a.avgER);

  const topEngagementDriver = platformEngagement[0];
  const driverText = topEngagementDriver ? `${topEngagementDriver.platform} drove engagement` : 'Mixed platform performance';

  // Card 2: Top Performing Post
  const topPost = posts.reduce((best, current) => 
    (current.reach || 0) > (best.reach || 0) ? current : best
  );

  const topPostReach = topPost.reach || 0;
  const topPostLikes = topPost.likes || 0;
  const topPostSaves = topPost.saves || 0;
  
  // Card 3: Follower Growth (estimated from follows field)
  const totalFollowerGrowth = posts.reduce((sum, post) => sum + (post.follows || 0), 0);
  
  // Calculate which platform drove most growth
  const platformGrowth = platforms.map(platform => {
    const platformPosts = posts.filter(p => p.platform === platform);
    const platformFollows = platformPosts.reduce((sum, post) => sum + (post.follows || 0), 0);
    return { platform, follows: platformFollows, percentage: (platformFollows / totalFollowerGrowth) * 100 };
  }).sort((a, b) => b.follows - a.follows);

  const topGrowthPlatform = platformGrowth[0];
  const growthDriverText = topGrowthPlatform && topGrowthPlatform.percentage > 0 
    ? `${topGrowthPlatform.platform} drove ${topGrowthPlatform.percentage.toFixed(0)}% of growth`
    : 'Distributed growth across platforms';

  // Estimate growth percentage (assuming baseline follower count)
  const estimatedGrowthPercent = totalFollowerGrowth > 0 ? Math.min((totalFollowerGrowth / 35000) * 100, 25) : 0; // Cap at 25%

  // Card 4: User Satisfaction (based on likes and high engagement posts)
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
  const highEngagementPosts = posts.filter(post => (post.engagement_rate || 0) > avgEngagementRate).length;
  const satisfactionMetric = (highEngagementPosts / totalPosts) * 100;
  
  const avgERComparison = satisfactionMetric > 50 ? `+${(satisfactionMetric - 50).toFixed(0)}% more ER than avg` : 'Meeting engagement targets';

  // --- Chart Data Generation and Storage ---
  // Group by date and platform, sum reach
  const datePlatformMap: Record<string, { instagram?: number, tiktok?: number }> = {};
  for (const post of posts) {
    const date = post.created_at?.slice(0, 10); // YYYY-MM-DD
    if (!date) continue;
    if (!datePlatformMap[date]) datePlatformMap[date] = {};
    if (post.platform === 'instagram') {
      datePlatformMap[date].instagram = (datePlatformMap[date].instagram || 0) + (post.reach || 0);
    } else if (post.platform === 'tiktok') {
      datePlatformMap[date].tiktok = (datePlatformMap[date].tiktok || 0) + (post.reach || 0);
    }
  }
  // Get all dates in range (from min to max date)
  const allDates = Object.keys(datePlatformMap).sort();
  if (allDates.length > 0) {
    const minDate = new Date(allDates[0]);
    const maxDate = new Date(allDates[allDates.length - 1]);
    const dateList: string[] = [];
    for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
      dateList.push(d.toISOString().slice(0, 10));
    }
    // Build series for each platform
    const instagramSeries = dateList.map(date => ({ date, value: datePlatformMap[date]?.instagram ?? null }));
    const tiktokSeries = dateList.map(date => ({ date, value: datePlatformMap[date]?.tiktok ?? null }));
    const instagramFilled = interpolateSeries(instagramSeries);
    const tiktokFilled = interpolateSeries(tiktokSeries);
    // Compose chartData array
    const chartData = dateList.map((date, i) => ({
      date,
      instagram: instagramFilled[i].value,
      tiktok: tiktokFilled[i].value,
    }));
    // Delete all previous data
    await supabase.from('analytics_chart_data').delete().neq('date', '');
    // Insert new data (in batches if needed)
    for (let i = 0; i < chartData.length; i += 500) {
      const batch = chartData.slice(i, i + 500);
      const { error: insertError } = await supabase.from('analytics_chart_data').insert(batch);
      if (insertError) throw new Error('Failed to insert chart data: ' + insertError.message);
    }
  }

  return {
    card1: {
      title: "Avg. Engagement Rate",
      value: `${avgEngagementRate.toFixed(1)}%`,
      text: erTrendText,
      subtext: driverText,
      trend: erTrend >= 0 ? "up" : "down",
      trendicon: erTrend >= 0 ? "↗" : "↘"
    },
    card2: {
      title: "Top Performing Post",
      value: `${formatNumber(topPostReach)} Reach`,
      text: `${topPost.platform || 'Social'}`,
      subtext: `${formatNumber(topPostLikes)} likes • ${formatNumber(topPostSaves)} saves`,
      trend: "up",
      trendicon: "🔥"
    },
    card3: {
      title: "Follower Growth",
      value: `+${totalFollowerGrowth.toLocaleString()}`,
      text: `+${estimatedGrowthPercent.toFixed(1)}%`,
      subtext: growthDriverText,
      trend: totalFollowerGrowth > 0 ? "up" : "neutral",
      trendicon: totalFollowerGrowth > 0 ? "📈" : "➡"
    },
    card4: {
      title: "User Satisfaction",
      value: `${formatNumber(totalLikes)} Likes`,
      text: "Peak Engagement",
      subtext: avgERComparison,
      trend: satisfactionMetric > 50 ? "up" : "neutral",
      trendicon: satisfactionMetric > 50 ? "⭐" : "👍"
    }
  };
}

// Helper: interpolate missing values in a time series
function interpolateSeries(series: { date: string, value: number|null }[]): { date: string, value: number }[] {
  // Forward fill, then backward fill, then interpolate
  // 1. Forward fill
  let lastValue: number|null = null;
  for (let i = 0; i < series.length; i++) {
    if (series[i].value == null && lastValue != null) {
      series[i].value = lastValue;
    } else if (series[i].value != null) {
      lastValue = series[i].value;
    }
  }
  // 2. Backward fill
  lastValue = null;
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i].value == null && lastValue != null) {
      series[i].value = lastValue;
    } else if (series[i].value != null) {
      lastValue = series[i].value;
    }
  }
  // 3. Interpolate (average of neighbors if still null)
  for (let i = 0; i < series.length; i++) {
    if (series[i].value == null) {
      // Find previous and next non-null
      let prev = i - 1;
      while (prev >= 0 && series[prev].value == null) prev--;
      let next = i + 1;
      while (next < series.length && series[next].value == null) next++;
      if (prev >= 0 && next < series.length && series[prev].value != null && series[next].value != null) {
        series[i].value = Math.round((series[prev].value! + series[next].value!) / 2);
      } else if (prev >= 0 && series[prev].value != null) {
        series[i].value = series[prev].value;
      } else if (next < series.length && series[next].value != null) {
        series[i].value = series[next].value;
      } else {
        series[i].value = 0;
      }
    }
  }
  // All values are now filled
  return series as { date: string, value: number }[];
} 
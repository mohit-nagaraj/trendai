"use client"
import { TrendingUpIcon, UsersIcon, VideoIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEffect, useState } from "react"

interface AnalyticsCard {
  title: string
  value: string
  text: string
  subtext: string
  trend: string
  trendicon: string
}

interface AnalyticsCardsResponse {
  card1: AnalyticsCard
  card2: AnalyticsCard
  card3: AnalyticsCard
  card4: AnalyticsCard
}

const iconMap: Record<string, React.ReactNode> = {
  "↗": <TrendingUpIcon className="size-3" />, // up
  "↘": <TrendingUpIcon className="size-3 rotate-180" />, // down
  "🔥": <VideoIcon className="size-4 text-orange-500" />,
  "📈": <UsersIcon className="size-3 text-green-600" />,
  "➡": <UsersIcon className="size-3" />,
  "⭐": <UsersIcon className="size-3 text-yellow-500" />,
  "👍": <UsersIcon className="size-3" />,
}

export function SectionCards() {
  const [cards, setCards] = useState<AnalyticsCardsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<{ postCount: number; generatedAt: string; source: string } | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch("/api/v1/analytics/cards")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to fetch analytics")
        }
        return res.json()
      })
      .then((data) => {
        setCards(data.cards)
        setMeta({
          postCount: data.postCount,
          generatedAt: data.generatedAt,
          source: data.source,
        })
        setError(null)
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch analytics")
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse h-40" />
        ))}
      </div>
    )
  }

  if (error || !cards) {
    return (
      <div className="p-4 text-center text-red-500">{error || "No analytics data available."}</div>
    )
  }

  // Helper to get icon for trendicon
  function getTrendIcon(icon: string) {
    return iconMap[icon] || null
  }

  // Card meta for subtext
  const postCountText = meta?.postCount ? `Based on ${meta.postCount} posts across platforms` : undefined

  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
      {/* Avg. Engagement Rate */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{cards.card1.title}</CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums">
            {cards.card1.value}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              {getTrendIcon(cards.card1.trendicon)}
              {cards.card1.text}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex items-center gap-2 font-medium">
            ↑ {cards.card1.subtext} <VideoIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">{postCountText}</div>
        </CardFooter>
      </Card>

      {/* Top Performing Post */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{cards.card2.title}</CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums">
            {cards.card2.value}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="text-xs">{cards.card2.text}</Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 font-medium">
            {cards.card2.subtext}
          </div>
          <div className="text-muted-foreground">This post performed well on <span className="capitalize">{cards.card2.text}</span></div>
        </CardFooter>
      </Card>

      {/* Follower Growth */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{cards.card3.title}</CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums">
            {cards.card3.value}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              {getTrendIcon(cards.card3.trendicon)}
              {cards.card3.text}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="font-medium">{cards.card3.subtext}</div>
          <div className="text-muted-foreground">Major spikes on weekends</div>
        </CardFooter>
      </Card>

      {/* User Satisfaction (renamed from Best Posting Time) */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{cards.card4.title}</CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums">
            {cards.card4.value}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              {getTrendIcon(cards.card4.trendicon)}
              {cards.card4.text}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="font-medium">{cards.card4.subtext}</div>
          <div className="text-muted-foreground">Across both IG & TikTok</div>
        </CardFooter>
      </Card>
    </div>
  )
}

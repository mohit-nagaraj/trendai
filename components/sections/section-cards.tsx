import { TrendingUpIcon, UsersIcon, ClockIcon, VideoIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
      
      {/* Avg. Engagement Rate */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Avg. Engagement Rate (Q2)</CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums">
            7.2%
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <TrendingUpIcon className="size-3" />
              +1.8% vs Q1
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex items-center gap-2 font-medium">
            ↑ Reels drove spikes <VideoIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Based on 87 posts across platforms</div>
        </CardFooter>
      </Card>

      {/* Top Performing Post */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Top Performing Post</CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums">
            104.2K Reach
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="text-xs">Instagram Reel</Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 font-medium">
            “5 AI Tools You Need in 2024”
          </div>
          <div className="text-muted-foreground">14.1% ER • 8.2K saves</div>
        </CardFooter>
      </Card>

      {/* Follower Growth */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Follower Growth (Q2)</CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums">
            +4,320
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <UsersIcon className="size-3" />
              +12.4%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="font-medium">TikTok drove 68% of growth</div>
          <div className="text-muted-foreground">Major spikes on weekends</div>
        </CardFooter>
      </Card>

      {/* Best Posting Time */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Best Time to Post</CardDescription>
          <CardTitle className="text-2xl @[250px]/card:text-3xl font-semibold tabular-nums">
            Fri 6–8 PM
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <ClockIcon className="size-3" />
              Peak Engagement
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="font-medium">+27% more ER than avg</div>
          <div className="text-muted-foreground">Across both IG & TikTok</div>
        </CardFooter>
      </Card>

    </div>
  )
}

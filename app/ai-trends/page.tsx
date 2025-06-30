import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TrendingUpIcon, RefreshCwIcon, LightbulbIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const trends = [
  { name: "AI-Generated Art", relevance: 9.2, platform: "Instagram" },
  { name: "Sustainable Fashion", relevance: 8.5, platform: "TikTok" },
  { name: "The 'Old Money' Aesthetic", relevance: 7.8, platform: "TikTok" },
  { name: "Mental Health Awareness", relevance: 7.5, platform: "Instagram" },
];

export default function AiTrendsPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="AI Trends" />
        <main className="p-4 md:p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">AI Trend Intelligence</h1>
              <p className="text-muted-foreground">
                Discover and analyze the latest social media trends.
              </p>
            </div>
            <Button>
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Refresh Trends
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trends.map((trend, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{trend.name}</CardTitle>
                    <Badge variant={trend.relevance > 8 ? "default" : "secondary"}>
                      {trend.relevance.toFixed(1)}
                    </Badge>
                  </div>
                  <CardDescription>{trend.platform}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    AI-powered analysis of this trend's potential for your brand.
                  </p>
                  <Button variant="outline" className="w-full">
                    <LightbulbIcon className="mr-2 h-4 w-4" />
                    Generate Content Ideas
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
} 
"use client";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RefreshCwIcon, LightbulbIcon, Dot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ContentIdeasTable, ContentIdea } from "@/components/visuals/content-ideas-table";
import { ChartPieDonut } from "@/components/visuals/chart-pie-donut";
import { ChartBarMixed } from "@/components/visuals/chart-bar-mixed";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlatformSelectionDialog } from "@/components/platform-selection-dialog";
import { toast } from "sonner";

// TODO: Replace with actual inspirationId source (e.g., from context, props, or selection)
const INSPIRATION_ID = "REPLACE_WITH_ACTUAL_ID";

export default function AiTrendsPage() {
  // Content Inspiration State
  type Inspiration = {
    title: string;
    source: string;
    description: string;
    final_score: number;
    created_at: string;
    keywords: string[];
    // Allow extra fields but type them as unknown
    [key: string]: string | number | string[] | undefined;
  };
  const [inspiration, setInspiration] = useState<Inspiration[]>([]);
  const [inspirationLoading, setInspirationLoading] = useState(true);
  const [latestTime, setLatestTime] = useState<Date | null>(null);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [barChartData, setBarChartData] = useState<Array<{ tag: string; volume: number }>>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOpen2, setDialogOpen2] = useState(false);
  const [activeInspiration, setActiveInspiration] = useState<Inspiration | null>(null);
  const [pieChartData, setPieChartData] = useState<Array<{ domain: string; value: number; fill: string }>>([]);
  const [pieChartConfig, setPieChartConfig] = useState<Record<string, { label: string; color?: string }> & { value: { label: string } }>({ value: { label: "Mentions" } });
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchInspiration() {
      setInspirationLoading(true);
      const { data, error } = await supabase
        .from('content_inspiration')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      setLatestTime(data && data.length > 0 ? new Date(data[0].created_at) : null);
      if (!error && data) {
        setInspiration(
          data
            .sort((a, b) => (b.final_score ?? 0) - (a.final_score ?? 0))
        );
        // Process keywords for bar chart
        const keywordCounts: Record<string, number> = {};
        data.forEach((item: Inspiration) => {
          if (Array.isArray(item.keywords)) {
            item.keywords.forEach((kw: string) => {
              const cleaned = kw.replace(/\b(20\d{2}|in \d{4}|\d{4})\b/g, '').replace(/\s+/g, ' ').trim().replace(/\s*,\s*/g, ',').replace(/\s*\([^)]*\)\s*/g, '').replace(/\s+$/, '');
              if (cleaned) {
                cleaned.split(' ').forEach(word => {
                  const w = word.trim();
                  if (w) {
                    keywordCounts[w] = (keywordCounts[w] || 0) + 1;
                  }
                });
              }
            });
          }
        });
        // Get top 5 keywords by count
        const topKeywords = Object.entries(keywordCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([tag, volume]) => ({ tag, volume }));
        setBarChartData(topKeywords);
        // Pie chart logic: extract all domains from sources arrays
        const domainCounts: Record<string, number> = {};
        data.forEach((item: Inspiration) => {
          if (Array.isArray(item.sources)) {
            item.sources.forEach((url: string) => {
              try {
                const domain = new URL(url).hostname.replace(/^www\./, '');
                if (domain) {
                  domainCounts[domain] = (domainCounts[domain] || 0) + 1;
                }
              } catch {}
            });
          }
        });
        // Get top 5 domains
        const colorPalette = [
          "var(--chart-1)",
          "var(--chart-2)",
          "var(--chart-3)",
          "var(--chart-4)",
          "var(--chart-5)"
        ];
        const topDomains = Object.entries(domainCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([domain, value], idx) => ({ domain, value, fill: colorPalette[idx % colorPalette.length] }));
        setPieChartData(topDomains);
        // Build dynamic config for pie chart
        const pieConfig = {
          value: { label: "Mentions" },
          ...Object.fromEntries(
            topDomains.map((item, idx) => [
              item.domain,
              { label: item.domain, color: colorPalette[idx % colorPalette.length] }
            ])
          )
        };
        setPieChartConfig(pieConfig);
      } else {
        setInspiration([]);
        setBarChartData([]);
        setPieChartData([]);
        setPieChartConfig({ value: { label: "Mentions" } });
      }
      setInspirationLoading(false);
    }
    fetchInspiration();
    fetchIdeas();
  }, []);

  // Helper to check if 24 hours have passed
  const canRefresh = !latestTime || (Date.now() - latestTime.getTime() > 24 * 60 * 60 * 1000);

  async function handleRefresh() {
    setRefreshLoading(true);
    try {
      await fetch("/api/v1/ideas", { method: "GET" });
      // Re-fetch inspiration after refresh
      const supabase = createClient();
      const { data } = await supabase
        .from('content_inspiration')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      setLatestTime(data && data.length > 0 ? new Date(data[0].created_at) : null);
      setInspiration(
        (data || [])
          .sort((a, b) => (b.final_score ?? 0) - (a.final_score ?? 0))
      );
      // Process keywords for bar chart
      const keywordCounts: Record<string, number> = {};
      (data || []).forEach((item: Inspiration) => {
        if (Array.isArray(item.keywords)) {
          item.keywords.forEach((kw: string) => {
            const cleaned = kw.replace(/\b(20\d{2}|in \d{4}|\d{4})\b/g, '').replace(/\s+/g, ' ').trim().replace(/\s*,\s*/g, ',').replace(/\s*\([^)]*\)\s*/g, '').replace(/\s+$/, '');
            if (cleaned) {
              cleaned.split(' ').forEach(word => {
                const w = word.trim();
                if (w) {
                  keywordCounts[w] = (keywordCounts[w] || 0) + 1;
                }
              });
            }
          });
        }
      });
      const topKeywords = Object.entries(keywordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, volume]) => ({ tag, volume }));
      setBarChartData(topKeywords);
      // Pie chart logic: extract all domains from sources arrays
      const domainCounts: Record<string, number> = {};
      (data || []).forEach((item: Inspiration) => {
        if (Array.isArray(item.sources)) {
          item.sources.forEach((url: string) => {
            try {
              const domain = new URL(url).hostname.replace(/^www\./, '');
              if (domain) {
                domainCounts[domain] = (domainCounts[domain] || 0) + 1;
              }
            } catch {}
          });
        }
      });
      const colorPalette = [
        "var(--chart-1)",
        "var(--chart-2)",
        "var(--chart-3)",
        "var(--chart-4)",
        "var(--chart-5)"
      ];
      const topDomains = Object.entries(domainCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([domain, value], idx) => ({ domain, value, fill: colorPalette[idx % colorPalette.length] }));
      setPieChartData(topDomains);
      const pieConfig = {
        value: { label: "Mentions" },
        ...Object.fromEntries(
          topDomains.map((item, idx) => [
            item.domain,
            { label: item.domain, color: colorPalette[idx % colorPalette.length] }
          ])
        )
      };
      setPieChartConfig(pieConfig);
    } finally {
      setRefreshLoading(false);
    }
  }

  // Fetch all content_ideas for the current inspiration
  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('content_ideas')
        .select('*')
      setIdeas(data || []);
    } catch (err) {
      console.error('Failed to fetch ideas', err);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle idea generation
  const handleGenerate = async (selectedPlatforms: string[]) => {
    setGenerateLoading(true);
    try {
      setDialogOpen2(false);
      toast.success("Generating ideas...");
      await fetch("/api/v1/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inspirationId: activeInspiration?.id, platforms: selectedPlatforms })
      });
      await fetchIdeas();
    } catch (err) {
      console.error('Failed to generate ideas', err);
    } finally {
      setGenerateLoading(false);
    }
  };

  // Handle row click to navigate to detail page
  const handleRowClick = (idea: ContentIdea) => {
    if (idea && idea.id) {
      router.push(`/ai-trends/${idea.id}`);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="AI Trends" />
        <main className="p-4 md:p-6 flex-1">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold">AI Trend Intelligence</h1>
              <p className="text-muted-foreground">
                {latestTime ? `Last fetched at: ${latestTime.toDateString()}` : "Discover and analyze the latest social media trends."}
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      onClick={handleRefresh}
                      disabled={!canRefresh || refreshLoading}
                      variant="default"
                      className={refreshLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
                    >
                      <RefreshCwIcon className={"mr-2 h-4 w-4" + (refreshLoading ? " animate-spin" : "")} />
                      {refreshLoading ? "Refreshing..." : "Refresh Trends"}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canRefresh && (
                  <TooltipContent>
                    24 Hours Cooldown Time
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

            {/* Inspiration Cards Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {inspirationLoading ? (
                <div className="col-span-4 flex items-center justify-center text-muted-foreground py-8">
                  <RefreshCwIcon className="mr-2 h-6 w-6 animate-spin" />
                  <p>Loading inspiration...</p>
                </div>
              ) : inspiration.length === 0 ? (
                null
              ) : (
                inspiration.map((item, index) => 
                    <Card
                      key={index}
                      className="gap-2 cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-xl"
                      onClick={() => { setActiveInspiration(item); setDialogOpen(true); }}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{item.title.length > 50 ? item.title.slice(0, 50) + "..." : item.title}</CardTitle>
                          <Badge className="" variant={item.final_score > 90 ? "default" : "secondary"}>
                            {item.final_score}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground mb-4">
                          {item.description.length > 120 ? item.description.slice(0, 120) + '…' : item.description}
                        </div>
                        
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={e => {
                              e.stopPropagation();
                              setActiveInspiration(item);
                              setDialogOpen2(true);                                
                            }}
                          >
                            <LightbulbIcon className="mr-2 h-4 w-4" />
                            Generate Content Ideas
                          </Button>

                      </CardContent>
                    </Card>
                  )
              )}
            </div>
            <ContentIdeasTable
              data={ideas}
              loading={loading}
              onRowClick={handleRowClick}
            />
            <div className="flex gap-4 px-4 lg:px-6">
              <div className="basis-1/2">
                <ChartPieDonut data={pieChartData} config={pieChartConfig} />
              </div>
              <div className="basis-1/2">
                <ChartBarMixed data={barChartData} />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
      {/* Dialog for full details */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg w-full">
          {activeInspiration && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{activeInspiration.title}</h2>
                <Badge variant={activeInspiration.final_score > 90 ? "default" : "secondary"}>{activeInspiration.final_score}</Badge>
              </div>
              <div className="text-xs text-muted-foreground flex items-center">Created: {new Date(activeInspiration.created_at).toLocaleString()} <Dot /> <a href={activeInspiration.source} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                Link                </a></div>

              <div>
                <span className="font-semibold">Description:</span>
                <div className="mt-1 text-sm">{activeInspiration.description}</div>
              </div>
              {activeInspiration.keywords && Array.isArray(activeInspiration.keywords) && (
                <div>
                  <span className="font-semibold">Keywords:</span>
                  <ul className="flex flex-wrap gap-2 mt-1">
                    {activeInspiration.keywords.map((kw, i) => (
                      <li key={i} className="bg-muted px-2 py-1 rounded text-xs">#{kw}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <PlatformSelectionDialog
        open={dialogOpen2}
        onOpenChange={setDialogOpen2}
        onGenerate={handleGenerate}
        loading={generateLoading}
      />
    </SidebarProvider>
  );
} 
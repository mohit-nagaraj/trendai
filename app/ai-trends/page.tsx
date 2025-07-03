"use client";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RefreshCwIcon, LightbulbIcon, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/visuals/data-table";
import data from "@/data.json";
import { ChartPieDonut } from "@/components/visuals/chart-pie-donut";
import { ChartBarMixed } from "@/components/visuals/chart-bar-mixed";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AiTrendsPage() {
  // Content Inspiration State
  const [inspiration, setInspiration] = useState<Array<{
    title: string;
    source: string;
    description: string;
    final_score: number;
    created_at?: string;
  }>>([]);
  const [inspirationLoading, setInspirationLoading] = useState(true);
  const [latestTime, setLatestTime] = useState<Date|null>(null);

  useEffect(() => {
    async function fetchInspiration() {
      setInspirationLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('content_inspiration')
        .select('title, source, description, final_score, created_at')
        .order('created_at', { ascending: false })
        .limit(4);
      setLatestTime(data && data.length > 0 ? new Date(data[0].created_at) : null);
      if (!error && data) {
        setInspiration(
          data
            .sort((a, b) => (b.final_score ?? 0) - (a.final_score ?? 0))
            .map(({ title, source, description, final_score, created_at }) => ({ title, source, description, final_score, created_at }))
        );
      } else {
        setInspiration([]);
      }
      setInspirationLoading(false);
    }
    fetchInspiration();
  }, []);

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
                {latestTime?`Last fetched at: ${latestTime.toDateString()}`:"Discover and analyze the latest social media trends."}
              </p>
            </div>
            <Button>
              <RefreshCwIcon className="mr-2 h-4 w-4 cursor-pointer" />
              Refresh Trends
            </Button>
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
              inspiration.map((item, index) => (
                <Card key={index} className="gap-2">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{item.title.length>50?item.title.slice(0,50)+"...":item.title}</CardTitle>
                      <Badge className="" variant={item.final_score > 90 ? "default" : "secondary"}>
                        {item.final_score}
                      </Badge>

                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                      {item.description.length > 120 ? item.description.slice(0, 120) + '…' : item.description}
                    </div>
                    <Button variant="outline" className="w-full">
                      <LightbulbIcon className="mr-2 h-4 w-4" />
                      Generate Content Ideas
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

            <DataTable data={data} />
            <div className="flex gap-4 px-4 lg:px-6">
                <div className="basis-1/2">
                  <ChartPieDonut />
                </div>
                <div className="basis-1/2">
                  <ChartBarMixed />
                </div>
              </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
} 
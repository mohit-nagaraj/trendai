"use client";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive area chart";

const chartData = [
  { date: "2024-04-01", instagram: 222, tiktok: 150 },
  { date: "2024-04-02", instagram: 97, tiktok: 180 },
  { date: "2024-04-03", instagram: 167, tiktok: 120 },
  { date: "2024-04-04", instagram: 242, tiktok: 260 },
  { date: "2024-04-05", instagram: 373, tiktok: 290 },
  { date: "2024-04-06", instagram: 301, tiktok: 340 },
  { date: "2024-04-07", instagram: 245, tiktok: 180 },
  { date: "2024-04-08", instagram: 409, tiktok: 320 },
  { date: "2024-04-09", instagram: 59, tiktok: 110 },
  { date: "2024-04-10", instagram: 261, tiktok: 190 },
  { date: "2024-04-11", instagram: 327, tiktok: 350 },
  { date: "2024-04-12", instagram: 292, tiktok: 210 },
  { date: "2024-04-13", instagram: 342, tiktok: 380 },
  { date: "2024-04-14", instagram: 137, tiktok: 220 },
  { date: "2024-04-15", instagram: 120, tiktok: 170 },
  { date: "2024-04-16", instagram: 138, tiktok: 190 },
  { date: "2024-04-17", instagram: 446, tiktok: 360 },
  { date: "2024-04-18", instagram: 364, tiktok: 410 },
  { date: "2024-04-19", instagram: 243, tiktok: 180 },
  { date: "2024-04-20", instagram: 89, tiktok: 150 },
  { date: "2024-04-21", instagram: 137, tiktok: 200 },
  { date: "2024-04-22", instagram: 224, tiktok: 170 },
  { date: "2024-04-23", instagram: 138, tiktok: 230 },
  { date: "2024-04-24", instagram: 387, tiktok: 290 },
  { date: "2024-04-25", instagram: 215, tiktok: 250 },
  { date: "2024-04-26", instagram: 75, tiktok: 130 },
  { date: "2024-04-27", instagram: 383, tiktok: 420 },
  { date: "2024-04-28", instagram: 122, tiktok: 180 },
  { date: "2024-04-29", instagram: 315, tiktok: 240 },
  { date: "2024-04-30", instagram: 454, tiktok: 380 },
  { date: "2024-05-01", instagram: 165, tiktok: 220 },
  { date: "2024-05-02", instagram: 293, tiktok: 310 },
  { date: "2024-05-03", instagram: 247, tiktok: 190 },
  { date: "2024-05-04", instagram: 385, tiktok: 420 },
  { date: "2024-05-05", instagram: 481, tiktok: 390 },
  { date: "2024-05-06", instagram: 498, tiktok: 520 },
  { date: "2024-05-07", instagram: 388, tiktok: 300 },
  { date: "2024-05-08", instagram: 149, tiktok: 210 },
  { date: "2024-05-09", instagram: 227, tiktok: 180 },
  { date: "2024-05-10", instagram: 293, tiktok: 330 },
  { date: "2024-05-11", instagram: 335, tiktok: 270 },
  { date: "2024-05-12", instagram: 197, tiktok: 240 },
  { date: "2024-05-13", instagram: 197, tiktok: 160 },
  { date: "2024-05-14", instagram: 448, tiktok: 490 },
  { date: "2024-05-15", instagram: 473, tiktok: 380 },
  { date: "2024-05-16", instagram: 338, tiktok: 400 },
  { date: "2024-05-17", instagram: 499, tiktok: 420 },
  { date: "2024-05-18", instagram: 315, tiktok: 350 },
  { date: "2024-05-19", instagram: 235, tiktok: 180 },
  { date: "2024-05-20", instagram: 177, tiktok: 230 },
  { date: "2024-05-21", instagram: 82, tiktok: 140 },
  { date: "2024-05-22", instagram: 81, tiktok: 120 },
  { date: "2024-05-23", instagram: 252, tiktok: 290 },
  { date: "2024-05-24", instagram: 294, tiktok: 220 },
  { date: "2024-05-25", instagram: 201, tiktok: 250 },
  { date: "2024-05-26", instagram: 213, tiktok: 170 },
  { date: "2024-05-27", instagram: 420, tiktok: 460 },
  { date: "2024-05-28", instagram: 233, tiktok: 190 },
  { date: "2024-05-29", instagram: 78, tiktok: 130 },
  { date: "2024-05-30", instagram: 340, tiktok: 280 },
  { date: "2024-05-31", instagram: 178, tiktok: 230 },
  { date: "2024-06-01", instagram: 178, tiktok: 200 },
  { date: "2024-06-02", instagram: 470, tiktok: 410 },
  { date: "2024-06-03", instagram: 103, tiktok: 160 },
  { date: "2024-06-04", instagram: 439, tiktok: 380 },
  { date: "2024-06-05", instagram: 88, tiktok: 140 },
  { date: "2024-06-06", instagram: 294, tiktok: 250 },
  { date: "2024-06-07", instagram: 323, tiktok: 370 },
  { date: "2024-06-08", instagram: 385, tiktok: 320 },
  { date: "2024-06-09", instagram: 438, tiktok: 480 },
  { date: "2024-06-10", instagram: 155, tiktok: 200 },
  { date: "2024-06-11", instagram: 92, tiktok: 150 },
  { date: "2024-06-12", instagram: 492, tiktok: 420 },
  { date: "2024-06-13", instagram: 81, tiktok: 130 },
  { date: "2024-06-14", instagram: 426, tiktok: 380 },
  { date: "2024-06-15", instagram: 307, tiktok: 350 },
  { date: "2024-06-16", instagram: 371, tiktok: 310 },
  { date: "2024-06-17", instagram: 475, tiktok: 520 },
  { date: "2024-06-18", instagram: 107, tiktok: 170 },
  { date: "2024-06-19", instagram: 341, tiktok: 290 },
  { date: "2024-06-20", instagram: 408, tiktok: 450 },
  { date: "2024-06-21", instagram: 169, tiktok: 210 },
  { date: "2024-06-22", instagram: 317, tiktok: 270 },
  { date: "2024-06-23", instagram: 480, tiktok: 530 },
  { date: "2024-06-24", instagram: 132, tiktok: 180 },
  { date: "2024-06-25", instagram: 141, tiktok: 190 },
  { date: "2024-06-26", instagram: 434, tiktok: 380 },
  { date: "2024-06-27", instagram: 448, tiktok: 490 },
  { date: "2024-06-28", instagram: 149, tiktok: 200 },
  { date: "2024-06-29", instagram: 103, tiktok: 160 },
  { date: "2024-06-30", instagram: 446, tiktok: 400 },
];

const chartConfig = {
  visitors: {
    label: "Views",
  },
  instagram: {
    label: "Instagram",
    color: "var(--chart-1)",
  },
  tiktok: {
    label: "TikTok",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Total Views</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            Aggregated view count across different platforms
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="90d" className="h-8 px-2.5">
              Last 3 months
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5">
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-instagram)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-instagram)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-tiktok)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-tiktok)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="tiktok"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-tiktok)"
              stackId="a"
            />
            <Area
              dataKey="instagram"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-instagram)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
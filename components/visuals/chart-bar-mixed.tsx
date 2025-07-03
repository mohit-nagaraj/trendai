"use client"

import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts"
import { LoaderCircle } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const colorPalette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)"
];

export function ChartBarMixed({ data, loading }: { data?: Array<{ tag: string; volume: number }>, loading?: boolean }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending Tags Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <LoaderCircle className="mr-2 h-6 w-6 animate-spin" />
            <span>Loading chart…</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending Tags Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No keyword data to display.
          </div>
        </CardContent>
      </Card>
    );
  }
  // Assign colors to each tag
  const chartDataToUse = data.map((item, idx) => ({
    ...item,
    fill: colorPalette[idx % colorPalette.length],
  }));
  // Build chartConfig dynamically for legend/colors
  const chartConfig = {
    volume: { label: "Volume" },
    ...Object.fromEntries(
      chartDataToUse.map((item, idx) => [
        item.tag,
        { label: item.tag, color: colorPalette[idx % colorPalette.length] }
      ])
    )
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Trending Tags</CardTitle>
        <CardDescription>Using these keywords may improve your reach</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartDataToUse}
            layout="vertical"
            margin={{ left: 20 }}
          >
            <YAxis
              dataKey="tag"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label || value
              }
            />
            <XAxis dataKey="volume" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="volume" radius={5} isAnimationActive fill="#8884d8">
              {chartDataToUse.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          The search is restricted to topics related to FinalRound AI
        </div>
        <div className="leading-none text-muted-foreground">
        May not be accurate
        </div>
      </CardFooter>
    </Card>
  );
}
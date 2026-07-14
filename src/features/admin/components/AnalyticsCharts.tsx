import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAnalytics } from "../hooks/useAdminAnalytics";

// Colors come exclusively from the design-token CSS variables.
// The signups chart is single-series (primary); the content chart pairs
// success + primary, which stay distinguishable under CVD simulation.
const signupsConfig = {
  users: {
    label: "New users",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const contentConfig = {
  posts: {
    label: "Posts",
    color: "hsl(var(--success))",
  },
  files: {
    label: "Files",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

function ChartCardSkeleton() {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  );
}

export function AnalyticsCharts() {
  const { data, isPending, isError } = useAdminAnalytics();

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive">Failed to load analytics.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-in">
      <Card className="rounded-xl shadow-elevation-sm">
        <CardHeader>
          <CardTitle>User Signups</CardTitle>
          <CardDescription>New registrations over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={signupsConfig} className="aspect-auto h-64 w-full">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <Area
                dataKey="users"
                type="monotone"
                stroke="var(--color-users)"
                strokeWidth={2}
                fill="url(#fillUsers)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-elevation-sm">
        <CardHeader>
          <CardTitle>Content Activity</CardTitle>
          <CardDescription>Posts vs files uploaded per month</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={contentConfig} className="aspect-auto h-64 w-full">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="posts" fill="var(--color-posts)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="files" fill="var(--color-files)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

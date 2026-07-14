import {
  FileText,
  FolderUp,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCardSkeleton } from "@/components/skeletons";
import { useAdminStats } from "../hooks/useAdminStats";
import type { AdminStats } from "../api/stats";

interface StatCardDef {
  key: keyof AdminStats;
  title: string;
  icon: LucideIcon;
  tile: string;
}

const CARDS: StatCardDef[] = [
  { key: "users", title: "Total Users", icon: Users, tile: "bg-primary/10 text-primary" },
  { key: "posts", title: "Total Posts", icon: FileText, tile: "bg-success/10 text-success" },
  { key: "messages", title: "Messages", icon: MessageCircle, tile: "bg-info/10 text-info" },
  { key: "files", title: "Files Uploaded", icon: FolderUp, tile: "bg-warning/10 text-warning" },
];

export function StatsCards() {
  const { data: stats, isPending, isError } = useAdminStats();

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <StatCardSkeleton key={card.key} />
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <p className="text-sm text-destructive">Failed to load platform stats. Try reloading.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {CARDS.map(({ key, title, icon: Icon, tile }) => {
        const stat = stats[key];
        const positive = stat.change >= 0;
        return (
          <Card key={key} className="rounded-xl shadow-elevation-sm animate-fade-in">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tile}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight">{stat.total.toLocaleString()}</p>
              <p
                className={`flex items-center gap-1 text-xs font-medium ${
                  positive ? "text-success" : "text-destructive"
                }`}
              >
                {positive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {positive ? "+" : ""}
                {stat.change}% vs last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

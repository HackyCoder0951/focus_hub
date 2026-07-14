import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Flag,
  History,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

interface QuickLink {
  to: string;
  icon: LucideIcon;
  tile: string;
  title: string;
  description: string;
}

const QUICK_LINKS: QuickLink[] = [
  {
    to: "/app/admin/dashboard",
    icon: BarChart3,
    tile: "bg-primary/10 text-primary",
    title: "Overview",
    description: "Platform stats, analytics and system health",
  },
  {
    to: "/app/admin/dashboard?tab=users",
    icon: Users,
    tile: "bg-success/10 text-success",
    title: "Users",
    description: "Manage members, status and profiles",
  },
  {
    to: "/app/admin/dashboard?tab=content",
    icon: Flag,
    tile: "bg-warning/10 text-warning",
    title: "Flagged Content",
    description: "Review open reports from the community",
  },
  {
    to: "/app/admin/dashboard?tab=reports",
    icon: History,
    tile: "bg-info/10 text-info",
    title: "Reports",
    description: "Resolved and dismissed flag history",
  },
];

const AdminWelcome = () => {
  const { user, profile } = useAuth();
  const name: string | undefined = profile?.full_name || user?.email || undefined;
  const firstName = name?.split(" ")[0];

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8 animate-fade-in">
      <Card className="overflow-hidden rounded-xl border-primary/20 shadow-elevation-md">
        <div className="bg-gradient-to-br from-primary/15 via-accent/60 to-transparent p-8 sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            Welcome{firstName ? `, ${firstName}` : ""}!
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            You are signed in as an administrator. From here you can monitor platform
            activity, manage users and review reported content.
          </p>
          <Button asChild className="mt-6">
            <Link to="/app/admin/dashboard">
              Open dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {QUICK_LINKS.map(({ to, icon: Icon, tile, title, description }) => (
          <Link key={to} to={to} className="group">
            <Card className="h-full rounded-xl shadow-elevation-sm transition-shadow group-hover:shadow-elevation-md">
              <CardContent className="flex items-start gap-4 p-5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tile}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminWelcome;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SystemHealthState {
  server: string;
  database: string;
  fileStorage: string;
  apiResponse: string;
}

const POLL_INTERVAL_MS = 10000;

const HEALTHY_BADGE = "bg-success/15 text-success border-success/30";
const UNHEALTHY_BADGE = "bg-destructive/15 text-destructive border-destructive/30";
const STORAGE_BADGE = "bg-warning/15 text-warning border-warning/30";

export function SystemHealth() {
  const [health, setHealth] = useState<SystemHealthState>({
    server: "Checking…",
    database: "Checking…",
    fileStorage: "—",
    apiResponse: "—",
  });

  useEffect(() => {
    let cancelled = false;

    const pollSystemHealth = async () => {
      let server = "Online";
      let database = "Healthy";
      let fileStorage = "0% Used";
      let apiResponse = "-";
      const start = performance.now();
      try {
        // Lightweight query to measure availability + latency.
        const { error } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true });
        const end = performance.now();
        apiResponse = `${Math.round(end - start)}ms`;
        if (error) {
          server = "Offline";
          database = "Unhealthy";
        } else {
          const { count: fileCount } = await supabase
            .from("filemodels")
            .select("id", { count: "exact", head: true });
          fileStorage = `${Math.min(100, Math.round(((fileCount ?? 0) / 1000) * 100))}% Used`;
        }
      } catch {
        server = "Offline";
        database = "Unhealthy";
        apiResponse = "Timeout";
      }
      if (!cancelled) {
        setHealth({ server, database, fileStorage, apiResponse });
      }
    };

    pollSystemHealth();
    const interval = setInterval(pollSystemHealth, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const serverHealthy = health.server === "Online";
  const dbHealthy = health.database === "Healthy";

  return (
    <Card className="rounded-xl shadow-elevation-sm animate-fade-in">
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Platform status and performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Server Status</span>
            <Badge
              variant="outline"
              className={serverHealthy ? HEALTHY_BADGE : UNHEALTHY_BADGE}
            >
              {health.server}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Database</span>
            <Badge variant="outline" className={dbHealthy ? HEALTHY_BADGE : UNHEALTHY_BADGE}>
              {health.database}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">File Storage</span>
            <Badge variant="outline" className={STORAGE_BADGE}>
              {health.fileStorage}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">API Response Time</span>
            <Badge variant="outline">{health.apiResponse}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

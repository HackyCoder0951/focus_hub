import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCards } from "@/features/admin/components/StatsCards";
import { AnalyticsCharts } from "@/features/admin/components/AnalyticsCharts";
import { RecentActivity } from "@/features/admin/components/RecentActivity";
import { SystemHealth } from "@/features/admin/components/SystemHealth";
import { UserManagement } from "@/features/admin/components/UserManagement";
import { FlaggedContent } from "@/features/admin/components/FlaggedContent";
import { ReportsTab } from "@/features/admin/components/ReportsTab";

const TABS = ["overview", "users", "content", "reports"] as const;
type AdminTab = (typeof TABS)[number];

function isAdminTab(value: string | null): value is AdminTab {
  return TABS.includes(value as AdminTab);
}

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: AdminTab = isAdminTab(tabParam) ? tabParam : "overview";

  const handleTabChange = (value: string) => {
    setSearchParams(value === "overview" ? {} : { tab: value }, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage your Focus platform</p>
      </div>

      <StatsCards />

      <Tabs value={tab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsCharts />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentActivity />
            <SystemHealth />
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="content">
          <FlaggedContent />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;

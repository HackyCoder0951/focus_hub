import { Download, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useConfirm } from "@/components/ConfirmDialog";
import { useExportData, useSignOutEverywhere } from "../hooks/useSettings";

export function AccountSettings() {
  const confirm = useConfirm();
  const exportData = useExportData();
  const signOutEverywhere = useSignOutEverywhere();

  const handleSignOutEverywhere = async () => {
    const confirmed = await confirm({
      title: "Sign out everywhere?",
      description:
        "This ends your session on every device where you are signed in, including this one.",
      confirmLabel: "Sign out everywhere",
      destructive: true,
    });
    if (confirmed) signOutEverywhere.mutate();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Your Data</CardTitle>
          <CardDescription>
            Download a copy of your profile, posts and file metadata as JSON.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => exportData.mutate()}
            disabled={exportData.isPending}
          >
            <Download className="mr-2 h-4 w-4" />
            {exportData.isPending ? "Preparing export..." : "Export my data"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Actions here affect all of your active sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="font-medium">Sign out everywhere</h4>
              <p className="text-sm text-muted-foreground">
                End every active session on all devices, including this one.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleSignOutEverywhere}
              disabled={signOutEverywhere.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {signOutEverywhere.isPending ? "Signing out..." : "Sign out everywhere"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

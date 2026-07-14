import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  parseSettings,
  type NotificationPrefs,
} from "../api/settingsSchema";
import { useSettingsProfile, useUpdatePreferences } from "../hooks/useSettings";
import { SettingRow } from "./SettingRow";

const ROWS: {
  key: keyof NotificationPrefs;
  label: string;
  description: string;
}[] = [
  {
    key: "email",
    label: "Email Notifications",
    description: "Receive notifications via email",
  },
  {
    key: "push",
    label: "Push Notifications",
    description: "Receive push notifications in your browser",
  },
  {
    key: "mentions",
    label: "Mentions",
    description: "When someone mentions you in a post",
  },
  {
    key: "comments",
    label: "Comments",
    description: "When someone comments on your posts",
  },
  {
    key: "follows",
    label: "New Followers",
    description: "When someone starts following you",
  },
  {
    key: "messages",
    label: "Messages",
    description: "When you receive a new message",
  },
];

export function NotificationSettings() {
  const { data: profile } = useSettingsProfile();
  const updatePreferences = useUpdatePreferences();

  const settings = parseSettings(profile?.settings);

  const handleToggle = (key: keyof NotificationPrefs, checked: boolean) => {
    updatePreferences.mutate({
      ...settings,
      notifications: { ...settings.notifications, [key]: checked },
    });
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose what notifications you want to receive. Changes are saved
          automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ROWS.map(({ key, label, description }) => (
            <SettingRow
              key={key}
              label={label}
              description={description}
              checked={settings.notifications[key]}
              disabled={!profile}
              onCheckedChange={(checked) => handleToggle(key, checked)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

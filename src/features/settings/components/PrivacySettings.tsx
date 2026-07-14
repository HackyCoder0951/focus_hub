import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { parseSettings, type PrivacyPrefs } from "../api/settingsSchema";
import { useSettingsProfile, useUpdatePreferences } from "../hooks/useSettings";
import { SettingRow } from "./SettingRow";

const ROWS: { key: keyof PrivacyPrefs; label: string; description: string }[] = [
  {
    key: "profilePublic",
    label: "Public Profile",
    description: "Make your profile visible to everyone",
  },
  {
    key: "showEmail",
    label: "Show Email",
    description: "Display your email address on your profile",
  },
  {
    key: "showLocation",
    label: "Show Location",
    description: "Display your location on your profile",
  },
  {
    key: "allowMessages",
    label: "Allow Messages",
    description: "Let other users send you messages",
  },
];

export function PrivacySettings() {
  const { data: profile } = useSettingsProfile();
  const updatePreferences = useUpdatePreferences();

  const settings = parseSettings(profile?.settings);

  const handleToggle = (key: keyof PrivacyPrefs, checked: boolean) => {
    updatePreferences.mutate({
      ...settings,
      privacy: { ...settings.privacy, [key]: checked },
    });
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>
          Control who can see your information and interact with you. Changes
          are saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ROWS.map(({ key, label, description }) => (
            <SettingRow
              key={key}
              label={label}
              description={description}
              checked={settings.privacy[key]}
              disabled={!profile}
              onCheckedChange={(checked) => handleToggle(key, checked)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

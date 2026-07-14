import { useState } from "react";
import {
  Bell,
  Eye,
  Palette,
  Shield,
  User,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileSettings } from "@/features/settings/components/ProfileSettings";
import { SecuritySettings } from "@/features/settings/components/SecuritySettings";
import { NotificationSettings } from "@/features/settings/components/NotificationSettings";
import { PrivacySettings } from "@/features/settings/components/PrivacySettings";
import { AppearanceSettings } from "@/features/settings/components/AppearanceSettings";
import { AccountSettings } from "@/features/settings/components/AccountSettings";

type SectionId =
  | "profile"
  | "security"
  | "notifications"
  | "privacy"
  | "appearance"
  | "account";

interface Section {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  /** Notifications/privacy are hidden for admins (preserved behavior). */
  adminHidden?: boolean;
}

const SECTIONS: Section[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell, adminHidden: true },
  { id: "privacy", label: "Privacy", icon: Eye, adminHidden: true },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "account", label: "Account", icon: UserCog },
];

const SECTION_CONTENT: Record<SectionId, () => JSX.Element> = {
  profile: ProfileSettings,
  security: SecuritySettings,
  notifications: NotificationSettings,
  privacy: PrivacySettings,
  appearance: AppearanceSettings,
  account: AccountSettings,
};

const Settings = () => {
  const { isAdmin } = useAuth();
  const [active, setActive] = useState<SectionId>("profile");

  const sections = SECTIONS.filter(
    (section) => !(isAdmin && section.adminHidden)
  );
  const activeSection =
    sections.find((section) => section.id === active) ?? sections[0];
  const ActiveContent = SECTION_CONTENT[activeSection.id];

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Mobile: section picker */}
      <div className="md:hidden">
        <Select
          value={activeSection.id}
          onValueChange={(value) => setActive(value as SectionId)}
        >
          <SelectTrigger aria-label="Settings section">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sections.map(({ id, label }) => (
              <SelectItem key={id} value={id}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Desktop: vertical section nav */}
        <nav className="hidden w-48 shrink-0 md:block" aria-label="Settings sections">
          <ul className="space-y-1">
            {sections.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setActive(id)}
                  aria-current={activeSection.id === id ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    activeSection.id === id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 flex-1" key={activeSection.id}>
          <ActiveContent />
        </div>
      </div>
    </div>
  );
};

export default Settings;

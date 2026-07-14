import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

/**
 * Tiny mock UI drawn purely with design tokens.
 *
 * The dark variant is wrapped in a `dark`-classed div so the token variables
 * re-scope to their dark values regardless of the active app theme. The app
 * stylesheet has no `.light` scope, so the light variant leans on tokens that
 * are white in BOTH themes (`primary-foreground`) plus tinted `primary`
 * bars — no hardcoded colors anywhere.
 */
function MiniMock({
  mode,
  className,
}: {
  mode: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      className={cn(
        mode,
        "h-16 w-full rounded-md border border-border p-2 text-left",
        mode === "dark" ? "bg-background" : "bg-primary-foreground",
        className
      )}
    >
      <div className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-1.5 w-3/4 rounded-full bg-primary/40" />
        <div className="h-1.5 w-1/2 rounded-full bg-primary/20" />
      </div>
    </div>
  );
}

function ThemePreview({ value }: { value: Theme }) {
  if (value === "system") {
    return (
      <div className="flex overflow-hidden rounded-md">
        <MiniMock mode="light" className="w-1/2 rounded-r-none" />
        <MiniMock mode="dark" className="w-1/2 rounded-l-none border-l-0" />
      </div>
    );
  }
  return <MiniMock mode={value} />;
}

const THEMES: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize how Focus looks and feels</CardDescription>
      </CardHeader>
      <CardContent>
        <h4 className="mb-3 font-medium">Theme</h4>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={theme === value}
              className={cn(
                "space-y-2 rounded-lg border border-border bg-card p-3 text-center transition-all hover:shadow-elevation-sm",
                theme === value && "ring-2 ring-primary"
              )}
            >
              <ThemePreview value={value} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel */}
      <aside className="relative hidden w-[45%] overflow-hidden border-r border-border/60 bg-sidebar lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "radial-gradient(hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>
        <Link to="/" className="relative z-10 flex items-center gap-2 p-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-elevation-sm">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Focus Hub</span>
        </Link>
        <div className="relative z-10 p-8 pb-12">
          <blockquote className="max-w-md text-2xl font-semibold leading-snug tracking-tight">
            Where your community learns, shares and grows — together.
          </blockquote>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Feed, Q&A with AI answers, real-time chat and resource sharing, all in one place.
          </p>
        </div>
      </aside>

      {/* Form side */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <Link to="/" className="mb-6 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-elevation-sm">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Focus Hub</span>
        </Link>
        <Card className="w-full max-w-md animate-slide-up rounded-xl border-border/60 shadow-elevation-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
      </main>
    </div>
  );
}

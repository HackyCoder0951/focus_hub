import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  MessageCircle,
  Book,
  FileText,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: Activity,
    title: "Social Feed",
    description: "Share posts, connect with peers, and stay updated with the latest happenings.",
  },
  {
    icon: Book,
    title: "Q&A Community",
    description: "Ask questions, share knowledge, and get AI-assisted answers from the community.",
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description: "Instant one-to-one and group messaging with presence and file sharing.",
  },
  {
    icon: FileText,
    title: "Resource Sharing",
    description: "Upload, preview, and share documents and study material with ease.",
  },
];

const Index = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (isAdmin) {
      navigate("/app/admin/dashboard", { replace: true });
    } else {
      navigate("/app", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Mesh gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Top nav */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-elevation-sm">
            <Zap className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">Focus Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-6xl px-6">
        <section className="flex flex-col items-center pb-20 pt-16 text-center md:pt-24">
          <div className="animate-slide-up inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Alumni community platform
          </div>
          <h1 className="mt-6 max-w-3xl animate-slide-up bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
            Where your community learns, shares and grows
          </h1>
          <p className="mt-6 max-w-2xl animate-slide-up text-lg text-muted-foreground">
            Focus Hub brings communication, knowledge sharing and collaboration together in one
            beautiful place — feed, Q&A, chat and resources included.
          </p>
          <div className="mt-8 flex animate-slide-up flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="px-8">
              <Link to="/register">
                Get started free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </section>

        {/* Feature grid */}
        <section className="grid gap-5 pb-20 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group animate-slide-up rounded-xl border-border/70 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevation-md"
              style={{ animationDelay: `${index * 75}ms`, animationFillMode: "backwards" }}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-transform duration-200 group-hover:scale-110">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold tracking-tight">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Social proof */}
        <section className="flex flex-col items-center gap-6 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            Join thousands of members already on Focus Hub
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">1k+</strong> posts shared
            </span>
            <span>
              <strong className="text-foreground">500+</strong> questions answered
            </span>
            <span>
              <strong className="text-foreground">300+</strong> resources uploaded
            </span>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Focus Hub</span>        
        </div>
      </footer>
    </div>
  );
};

export default Index;

import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Book,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme-provider";
import type { ProfileLite } from "@/shared/types/db";

const pages = [
  { name: "Feed", href: "/app/feed", icon: Activity },
  { name: "Q&A", href: "/app/qa", icon: Book },
  { name: "Chat", href: "/app/chat", icon: MessageCircle },
  { name: "Resources", href: "/app/resources", icon: FileText },
  { name: "Profile", href: "/app/profile", icon: User },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [people, setPeople] = React.useState<ProfileLite[]>([]);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (!open || !query.trim()) {
      setPeople([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .ilike("full_name", `%${query}%`)
        .limit(6);
      setPeople(data ?? []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [open, query]);

  const run = (fn: () => void) => {
    setOpen(false);
    setQuery("");
    fn();
  };

  return (
    <>
      <Button
        variant="outline"
        className="h-9 w-full max-w-64 justify-start gap-2 text-muted-foreground sm:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="truncate">Search…</span>
        <kbd className="pointer-events-none ml-auto hidden rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search pages, people, actions…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {pages.map((page) => (
              <CommandItem key={page.href} onSelect={() => run(() => navigate(page.href))}>
                <page.icon className="mr-2 h-4 w-4" />
                {page.name}
              </CommandItem>
            ))}
            {isAdmin && (
              <CommandItem onSelect={() => run(() => navigate("/app/admin/dashboard"))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Admin Dashboard
              </CommandItem>
            )}
          </CommandGroup>
          {people.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="People">
                {people.map((person) => (
                  <CommandItem
                    key={person.id}
                    value={`person-${person.full_name}-${person.id}`}
                    onSelect={() => run(() => navigate(`/app/profile?user_id=${person.id}`))}
                  >
                    <Avatar className="mr-2 h-6 w-6">
                      <AvatarImage src={person.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {(person.full_name || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {person.full_name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => run(() => setTheme(theme === "dark" ? "light" : "dark"))}>
              {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              Toggle theme
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

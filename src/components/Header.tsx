import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "./CommandPalette";
import NotificationDropdown from "./NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";

const pageTitles: Array<[string, string]> = [
  ["/app/feed", "Feed"],
  ["/app/qa", "Q&A"],
  ["/app/resources", "Resources"],
  ["/app/chat", "Chat"],
  ["/app/profile", "Profile"],
  ["/app/settings", "Settings"],
  ["/app/admin/dashboard", "Admin Dashboard"],
  ["/app/admin", "Admin"],
  ["/app/followers", "Followers"],
  ["/app/following", "Following"],
];

const Header = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const title = pageTitles.find(([prefix]) => location.pathname.startsWith(prefix))?.[1] ?? "";

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <SidebarTrigger aria-label="Toggle sidebar" />
      <Separator orientation="vertical" className="h-5" />
      {title && (
        <h1 className="hidden truncate text-sm font-medium text-foreground md:block">{title}</h1>
      )}

      <div className="ml-auto flex items-center gap-2">
        <CommandPalette />
        <ThemeToggle />
        <NotificationDropdown />
        <Separator orientation="vertical" className="hidden h-5 lg:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="Account menu">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {profile?.full_name ? getInitials(profile.full_name) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                {isAdmin && (
                  <p className="text-xs font-medium leading-none text-primary">Admin</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/app/profile")}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/app/settings")}>Settings</DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate("/app/admin/dashboard")}>
                Admin Dashboard
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;

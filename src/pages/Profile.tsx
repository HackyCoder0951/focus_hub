import { useState, type ComponentProps } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  FileText,
  FolderOpen,
  Link as LinkIcon,
  MapPin,
  Pencil,
  UserX,
} from "lucide-react";
import PostCard from "@/components/PostCard";
import FileCard from "@/components/FileCard";
import ProfileFollowButton from "@/components/ProfileFollowButton";
import FollowersStats from "@/components/FollowersStats";
import { EmptyState } from "@/components/EmptyState";
import { PostCardSkeleton, ProfileHeaderSkeleton, ResourceCardSkeleton } from "@/components/skeletons";
import { useAuth } from "@/contexts/AuthContext";
import {
  useProfile,
  useProfileActivity,
  useProfileRole,
  useQaStats,
  useUserFiles,
  useUserPosts,
} from "@/features/profile/hooks/useProfile";
import { ActivityTimeline } from "@/features/profile/components/ActivityTimeline";
import { QaStatsCard } from "@/features/profile/components/QaStatsCard";

type PostCardPost = ComponentProps<typeof PostCard>["post"];

const TAB_TRIGGER_CLASS =
  "rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none";

function AboutCard({ bio, website, location }: { bio?: string | null; website?: string | null; location?: string | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="mb-2 font-semibold">Bio</h4>
          <p className="text-sm text-muted-foreground">{bio || "No bio yet."}</p>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">Website</h4>
          <p className="text-sm text-muted-foreground">{website || "—"}</p>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">Location</h4>
          <p className="text-sm text-muted-foreground">{location || "—"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const Profile = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");

  // Keep the ?user_id= query-param behavior for viewing other profiles.
  const queryUserId = new URLSearchParams(location.search).get("user_id");
  const profileUserId = queryUserId || user?.id;

  const { data: profileData, isLoading } = useProfile(profileUserId);
  const { data: profileRole } = useProfileRole(profileUserId);
  const postsQuery = useUserPosts(profileUserId);
  const filesQuery = useUserFiles(profileUserId);
  const activityQuery = useProfileActivity(profileUserId);
  const qaStatsQuery = useQaStats(profileUserId);

  const isAdmin = profileRole === "admin";
  const isOwnProfile = !!user && user.id === profileUserId;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <ProfileHeaderSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="mx-auto max-w-4xl">
        <EmptyState
          icon={UserX}
          title="Profile not found"
          description="This profile doesn't exist or is no longer available."
        />
      </div>
    );
  }

  const memberType = profileData.member_type;
  const posts = postsQuery.data ?? [];
  const files = filesQuery.data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      {/* Banner header */}
      <Card className="overflow-hidden rounded-xl">
        <div className="h-32 bg-gradient-to-r from-primary/25 via-accent to-primary/10" />
        <CardContent className="p-6 pt-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar className="-mt-12 h-24 w-24 ring-4 ring-background">
                <AvatarImage src={profileData.avatar_url ?? undefined} />
                <AvatarFallback className="text-2xl">
                  {profileData.full_name ? profileData.full_name[0] : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="pb-1">
                <h1 className="text-2xl font-bold">{profileData.full_name}</h1>
                <p className="text-sm text-muted-foreground">{profileData.email}</p>
                <div className="mt-1 flex gap-2">
                  {isAdmin && <Badge variant="destructive">Admin</Badge>}
                  {memberType && (
                    <Badge variant="secondary">
                      {memberType === "student" ? "Student" : memberType === "alumni" ? "Alumni" : memberType}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pb-1">
              {isOwnProfile ? (
                <Button variant="outline" onClick={() => navigate("/app/settings")}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <ProfileFollowButton profileUserId={profileData.id} />
              )}
            </div>
          </div>

          {profileData.bio && <p className="mt-4 text-sm">{profileData.bio}</p>}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {profileData.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {profileData.location}
              </div>
            )}
            {profileData.website && (
              <div className="flex items-center gap-1">
                <LinkIcon className="h-4 w-4" />
                <a
                  href={profileData.website}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profileData.website}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : ""}
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin ? (
        <AboutCard bio={profileData.bio} website={profileData.website} location={profileData.location} />
      ) : (
        <>
          {/* Stat pills + Q&A stats */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-center transition-colors hover:bg-accent"
                onClick={() => setActiveTab("posts")}
              >
                <div className="font-semibold">{posts.length}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </button>
              <FollowersStats profileUserId={profileData.id} />
            </div>
            <QaStatsCard stats={qaStatsQuery.data} isLoading={qaStatsQuery.isLoading} />
          </div>

          {/* Content tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0">
              <TabsTrigger value="posts" className={TAB_TRIGGER_CLASS}>
                Posts
              </TabsTrigger>
              <TabsTrigger value="files" className={TAB_TRIGGER_CLASS}>
                Files
              </TabsTrigger>
              <TabsTrigger value="activity" className={TAB_TRIGGER_CLASS}>
                Activity
              </TabsTrigger>
              <TabsTrigger value="about" className={TAB_TRIGGER_CLASS}>
                About
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-6">
              {postsQuery.isLoading ? (
                <>
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                </>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent>
                    <EmptyState
                      icon={FileText}
                      title="No posts yet"
                      description="Posts shared by this user will appear here."
                    />
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post as unknown as PostCardPost} />
                ))
              )}
            </TabsContent>

            <TabsContent value="files">
              {filesQuery.isLoading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ResourceCardSkeleton key={i} />
                  ))}
                </div>
              ) : files.length === 0 ? (
                <Card>
                  <CardContent>
                    <EmptyState
                      icon={FolderOpen}
                      title="No files yet"
                      description="Files uploaded by this user will appear here."
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {files.map((file) => (
                    <FileCard key={file.id} file={file} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity">
              <ActivityTimeline items={activityQuery.data} isLoading={activityQuery.isLoading} />
            </TabsContent>

            <TabsContent value="about">
              <AboutCard bio={profileData.bio} website={profileData.website} location={profileData.location} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Profile;

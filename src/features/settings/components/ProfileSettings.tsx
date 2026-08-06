import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/ConfirmDialog";
import type { Profile } from "@/shared/types/db";
import {
  useSettingsProfile,
  useUpdateProfile,
  type ProfileFields,
} from "../hooks/useSettings";
import {
  useMyAlumniRequest,
  useRevertToStudent,
  useSubmitAlumniRequest,
} from "../hooks/useAlumniVerification";

const emptyFields: ProfileFields = {
  full_name: "",
  bio: "",
  website: "",
  location: "",
  company: "",
  designation: "",
};

interface AlumniMembershipSectionProps {
  profile: Profile | undefined;
  fields: ProfileFields;
  setField: (key: keyof ProfileFields, value: string) => void;
}

/** Member-type display + the alumni verification request / revert flow. */
function AlumniMembershipSection({ profile, fields, setField }: AlumniMembershipSectionProps) {
  const { data: myRequest } = useMyAlumniRequest();
  const submitRequest = useSubmitAlumniRequest();
  const revertToStudent = useRevertToStudent();
  const confirm = useConfirm();

  const [requestForm, setRequestForm] = useState({
    graduation_year: "",
    company: "",
    designation: "",
  });

  const handleRevert = async () => {
    const ok = await confirm({
      title: "Revert to student",
      description:
        "You'll lose your alumni status and alumni-only profile fields. You can request verification again later.",
      confirmLabel: "Revert to student",
      destructive: true,
    });
    if (!ok) return;
    revertToStudent.mutate();
  };

  const handleSubmitRequest = () => {
    submitRequest.mutate({
      graduation_year: requestForm.graduation_year ? Number(requestForm.graduation_year) : null,
      company: requestForm.company.trim() || null,
      designation: requestForm.designation.trim() || null,
    });
  };

  if (profile?.member_type === "alumni") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label>Member Type</Label>
          <Badge variant="secondary">Verified Alumni</Badge>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="graduation-year">Graduation Year</Label>
            <Input id="graduation-year" value={profile.graduation_year ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={fields.company}
              onChange={(e) => setField("company", e.target.value)}
              placeholder="Current company"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              value={fields.designation}
              onChange={(e) => setField("designation", e.target.value)}
              placeholder="Job title"
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRevert}
          disabled={revertToStudent.isPending}
        >
          {revertToStudent.isPending ? "Reverting..." : "Revert to Student"}
        </Button>
      </div>
    );
  }

  const pending = myRequest?.status === "pending";
  const rejected = myRequest?.status === "rejected";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label>Member Type</Label>
        <Badge variant="secondary">Student</Badge>
        {pending && <Badge variant="outline">Verification pending</Badge>}
        {rejected && <Badge variant="destructive">Request rejected</Badge>}
      </div>
      {pending ? (
        <p className="text-sm text-muted-foreground">
          Your request to become alumni is awaiting admin review.
        </p>
      ) : (
        <div className="space-y-3 rounded-lg border p-4">
          <p className="text-sm font-medium">Request Alumni Verification</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="req-grad-year">Graduation Year</Label>
              <Input
                id="req-grad-year"
                type="number"
                value={requestForm.graduation_year}
                onChange={(e) =>
                  setRequestForm((prev) => ({ ...prev, graduation_year: e.target.value }))
                }
                placeholder="e.g. 2022"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-company">Company</Label>
              <Input
                id="req-company"
                value={requestForm.company}
                onChange={(e) => setRequestForm((prev) => ({ ...prev, company: e.target.value }))}
                placeholder="Current company"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-designation">Designation</Label>
              <Input
                id="req-designation"
                value={requestForm.designation}
                onChange={(e) =>
                  setRequestForm((prev) => ({ ...prev, designation: e.target.value }))
                }
                placeholder="Job title"
              />
            </div>
          </div>
          <Button size="sm" onClick={handleSubmitRequest} disabled={submitRequest.isPending}>
            {submitRequest.isPending
              ? "Submitting..."
              : rejected
                ? "Resubmit Request"
                : "Request Alumni Verification"}
          </Button>
        </div>
      )}
    </div>
  );
}

export function ProfileSettings() {
  const { data: profile } = useSettingsProfile();
  const updateProfile = useUpdateProfile();

  const [fields, setFields] = useState<ProfileFields>(emptyFields);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Populate the form once the profile row arrives (and after saves).
  useEffect(() => {
    if (profile) {
      setFields({
        full_name: profile.full_name ?? "",
        bio: profile.bio ?? "",
        website: profile.website ?? "",
        location: profile.location ?? "",
        company: profile.company ?? "",
        designation: profile.designation ?? "",
      });
    }
  }, [profile]);

  // Release the local object URL when replaced or on unmount.
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const setField = (key: keyof ProfileFields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    updateProfile.mutate({ avatarFile: file });
    event.target.value = "";
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    updateProfile.mutate({ removeAvatar: true });
  };

  const saving = updateProfile.isPending;
  const initial = profile?.full_name?.[0]?.toUpperCase() ?? "U";

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your profile details and public information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={avatarPreview ?? profile?.avatar_url ?? undefined}
              alt="Your avatar"
            />
            <AvatarFallback className="text-lg">{initial}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h3 className="font-semibold">Profile Picture</h3>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="avatar-upload"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "cursor-pointer",
                  saving && "pointer-events-none opacity-50"
                )}
              >
                {saving ? "Uploading..." : "Change Avatar"}
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarChange}
                disabled={saving}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveAvatar}
                disabled={saving || !profile?.avatar_url}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={fields.full_name}
              onChange={(e) => setField("full_name", e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile?.email ?? ""} disabled />
            <p className="text-xs text-muted-foreground">
              Your email is tied to your account and cannot be changed here.
            </p>
          </div>
        </div>

        <AlumniMembershipSection profile={profile} fields={fields} setField={setField} />

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={fields.bio}
            onChange={(e) => setField("bio", e.target.value)}
            rows={3}
            placeholder="Enter your bio"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={fields.website}
              onChange={(e) => setField("website", e.target.value)}
              placeholder="Enter your website"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={fields.location}
              onChange={(e) => setField("location", e.target.value)}
              placeholder="Enter your location"
            />
          </div>
        </div>

        <Button
          onClick={() => updateProfile.mutate({ fields })}
          disabled={saving || !profile}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}

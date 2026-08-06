import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { UserListItem } from "@/features/profile/components/UserListItem";
import { useAlumniDirectory } from "@/features/directory/hooks/useAlumniDirectory";

/** Small trailing summary shown next to each directory row's name/bio. */
function AlumniMeta({
  graduationYear,
  company,
  designation,
}: {
  graduationYear: number | null;
  company: string | null;
  designation: string | null;
}) {
  const parts = [designation, company, graduationYear ? `Class of ${graduationYear}` : null].filter(
    Boolean
  );
  if (parts.length === 0) return null;
  return <span className="whitespace-nowrap text-xs text-muted-foreground">{parts.join(" · ")}</span>;
}

const AlumniDirectory = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  // Small debounce so we're not hitting the DB on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data: alumni, isLoading } = useAlumniDirectory({
    search: search || undefined,
    graduationYear: graduationYear ? Number(graduationYear) : undefined,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8 animate-fade-in">
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Alumni Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or company"
            />
            <Input
              type="number"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              placeholder="Graduation year"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : !alumni || alumni.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No alumni found"
              description="Try a different search or clear the graduation year filter."
            />
          ) : (
            <ul className="space-y-1">
              {alumni.map((entry) => (
                <UserListItem
                  key={entry.id}
                  user={entry}
                  action={
                    <AlumniMeta
                      graduationYear={entry.graduation_year}
                      company={entry.company}
                      designation={entry.designation}
                    />
                  }
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlumniDirectory;

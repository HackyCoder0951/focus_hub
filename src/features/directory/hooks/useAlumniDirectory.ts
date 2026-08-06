import { useQuery } from "@tanstack/react-query";
import { qk } from "@/shared/lib/queryKeys";
import { fetchAlumniDirectory, type AlumniDirectoryFilters } from "../api/directory";

export function useAlumniDirectory(filters: AlumniDirectoryFilters = {}) {
  return useQuery({
    queryKey: qk.directory.alumni(filters),
    queryFn: () => fetchAlumniDirectory(filters),
  });
}

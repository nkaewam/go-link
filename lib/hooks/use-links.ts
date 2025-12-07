import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchRecentLinks,
  fetchLinks,
  createLink,
  updateLink,
  searchLinks,
  type LinkData,
  type LinksResponse,
  type CreateLinkParams,
  type UpdateLinkParams,
  type SearchResult,
} from "@/lib/api/links";

/**
 * Query key factories for consistent cache key management
 */
export const linkKeys = {
  all: ["links"] as const,
  recent: (limit: number) => [...linkKeys.all, "recent", limit] as const,
  list: (page: number, limit: number, search: string) =>
    [...linkKeys.all, "list", page, limit, search] as const,
  search: (query: string) => [...linkKeys.all, "search", query] as const,
};

/**
 * Hook to fetch recent links
 */
export function useRecentLinks(limit: number = 4) {
  return useQuery({
    queryKey: linkKeys.recent(limit),
    queryFn: () => fetchRecentLinks(limit),
  });
}

/**
 * Hook to fetch paginated links with search
 */
export function useLinks(
  page: number = 1,
  limit: number = 10,
  search: string = ""
) {
  return useQuery({
    queryKey: linkKeys.list(page, limit, search),
    queryFn: () => fetchLinks(page, limit, search),
  });
}

/**
 * Hook to create a new link
 */
export function useCreateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateLinkParams) => createLink(params),
    onSuccess: () => {
      // Invalidate and refetch recent links and list queries
      queryClient.invalidateQueries({ queryKey: linkKeys.all });
    },
  });
}

/**
 * Hook to update an existing link
 */
export function useUpdateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: UpdateLinkParams }) =>
      updateLink(id, params),
    onSuccess: () => {
      // Invalidate and refetch all link queries
      queryClient.invalidateQueries({ queryKey: linkKeys.all });
    },
  });
}

/**
 * Hook to search links semantically
 */
export function useSearchLinks(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: linkKeys.search(query),
    queryFn: () => searchLinks(query),
    enabled: enabled && query.length > 0,
  });
}


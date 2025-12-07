"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Copy,
  Trash2,
  Edit2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { useLinks } from "@/lib/hooks/use-links";
import { timeAgo } from "@/lib/utils";
import type { LinkData } from "@/lib/api/links";
import { EditLinkDialog } from "@/components/links/edit-link-dialog";
import { toast } from "sonner";

// Simple debounce hook implementation
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function BrowsePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingLink, setEditingLink] = useState<LinkData | null>(null);
  const debouncedSearch = useDebounceValue(search, 500);

  const { data, isLoading: loading } = useLinks(page, 10, debouncedSearch);
  const links = data?.data ?? [];
  const pagination = data?.pagination ?? null;

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Browse Links</h1>
          <p className="text-on-surface-variant mt-1">
            Manage and view all your go links
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <Input
              placeholder="Search links..."
              className="pl-9 bg-surface-container-high border-none h-10 rounded-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="border-none bg-surface-container-low overflow-hidden rounded-3xl flex flex-col">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-surface-container-highest/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                  Alias
                </TableHead>
                <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                  Destination
                </TableHead>
                <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                  Visits
                </TableHead>
                <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                  Created
                </TableHead>
                <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                  Owner
                </TableHead>
                <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : links.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No links found.
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link: LinkData) => (
                  <TableRow
                    key={link.id}
                    className="group border-outline-variant/10 hover:bg-surface-container-highest/30"
                  >
                    <TableCell className="px-6 py-4 font-medium text-primary font-mono text-base">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/-/links/${link.id}`}
                          className="hover:underline"
                        >
                          go/{link.shortCode}
                        </Link>
                        <a
                          href={`/${link.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-on-surface-variant hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-on-surface-variant max-w-[300px] truncate">
                      {link.url}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-on-surface-variant">
                      {link.visits}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-on-surface-variant">
                      {timeAgo(link.createdAt)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-on-surface-variant">
                      {link.owner || "-"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="text"
                          size="icon"
                          className="h-8 w-8 text-on-surface-variant hover:text-primary"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                `go/${link.shortCode}`
                              );
                              toast.success("Copied to clipboard!");
                            } catch (error) {
                              toast.error("Failed to copy to clipboard");
                            }
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="text"
                          size="icon"
                          className="h-8 w-8 text-on-surface-variant hover:text-primary"
                          onClick={() => setEditingLink(link)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="text"
                          size="icon"
                          className="h-8 w-8 text-on-surface-variant hover:text-error hover:bg-error/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/10 bg-surface-container-low">
          <div className="text-sm text-on-surface-variant">
            {pagination && (
              <>
                Showing{" "}
                <span className="font-medium">
                  {Math.min(
                    (pagination.page - 1) * pagination.limit + 1,
                    pagination.total
                  )}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </span>{" "}
                of <span className="font-medium">{pagination.total}</span>{" "}
                results
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium text-on-surface min-w-12 text-center">
              Page {page} of {pagination?.totalPages || 1}
            </div>
            <Button
              variant="outlined"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(pagination?.totalPages || 1, p + 1))
              }
              disabled={
                !pagination || page === pagination.totalPages || loading
              }
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {editingLink && (
        <EditLinkDialog
          link={editingLink}
          open={!!editingLink}
          onOpenChange={(open) => {
            if (!open) {
              setEditingLink(null);
            }
          }}
        />
      )}
    </div>
  );
}

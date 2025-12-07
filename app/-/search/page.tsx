"use client";

import { useState, useEffect, Suspense } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Search,
  Link2,
  Copy,
  BarChart3,
  Clock,
  Loader2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useSearchLinks } from "@/lib/hooks/use-links";
import { timeAgo, copyToClipboard } from "@/lib/utils";

const searchSchema = z.object({
  query: z.string().min(1, "Please enter a search term"),
});

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "",
    },
  });

  const searchParams = useSearchParams();
  const { data: results = [], isLoading: loading } = useSearchLinks(
    searchQuery,
    searched && searchQuery.length > 0
  );

  const onSubmit = (values: z.infer<typeof searchSchema>) => {
    setSearchQuery(values.query);
    setSearched(true);
  };

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      form.setValue("query", query);
      setSearchQuery(query);
      setSearched(true);
    }
  }, [searchParams, form]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors overflow-hidden relative">
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-8 pt-10">
          {/* Header & Search Bar */}
          <div className="space-y-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight">Search Links</h1>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="relative max-w-xl mx-auto"
              >
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative group/input">
                          <Input
                            placeholder="Search by keyword, description, or concept..."
                            className="pl-12 h-14 rounded-full bg-surface-container-highest border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-lg shadow-sm"
                            {...field}
                          />
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                          <Button
                            type="submit"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-10 h-10"
                            disabled={loading || !field.value.trim()}
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ArrowRight className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                Searching...
              </div>
            ) : searched && results.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No results found for "{searchQuery}".
              </div>
            ) : (
              results.map((result) => (
                <Card
                  key={result.id}
                  className="border-none bg-surface-container-low/50 hover:bg-surface-container-high/50 transition-colors"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                        <Link2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/-/links/${result.id}`}
                              className="text-xl font-semibold text-primary hover:underline truncate"
                            >
                              go/{result.shortCode}
                            </Link>
                            <a
                              href={`/${result.shortCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-on-surface-variant hover:text-primary"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground bg-surface-container px-2 py-1 rounded-md">
                              {(result.similarity * 100).toFixed(0)}% match
                            </span>
                            <Button
                              variant="text"
                              size="icon"
                              className="h-8 w-8 text-on-surface-variant hover:text-primary"
                              onClick={() =>
                                copyToClipboard(`go/${result.shortCode}`)
                              }
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Link href={`/-/links/${result.id}`}>
                              <Button
                                variant="outlined"
                                size="sm"
                                className="h-8"
                              >
                                Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {result.url}
                        </p>
                        {result.description && (
                          <p className="text-sm text-on-surface-variant line-clamp-2 mt-2">
                            {result.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 pt-2 mt-2 text-xs text-muted-foreground border-t border-outline-variant/20">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            {result.visits} visits
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(result.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-outline-variant/30 bg-background/80 backdrop-blur">
        <div className="max-w-5xl mx-auto flex flex-col gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 text-lg font-semibold text-primary">
              <Link2 className="w-5 h-5" />
              go/-/search
            </div>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full"
              role="search"
            >
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormControl>
                      <InputGroup>
                        <InputGroupInput
                          placeholder="Search links like you would on Google..."
                          autoFocus
                          {...field}
                        />
                        <InputGroupAddon align="inline-start">
                          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                        </InputGroupAddon>
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="submit"
                            size="icon"
                            className="h-10 w-10"
                            disabled={loading || !field.value.trim()}
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ArrowRight className="w-4 h-4" />
                            )}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Searching…
          </div>
        ) : searched && results.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No results found for “{searchQuery}”.
          </div>
        ) : !searched ? (
          <div className="text-muted-foreground text-sm">
            Start typing to search your links.
          </div>
        ) : (
          <>
            <div className="text-xs text-muted-foreground">
              About {results.length} results for “{searchQuery}”
            </div>
            <div className="space-y-5">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="group rounded-xl px-3 py-3 transition-colors hover:bg-surface-container-low/60"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Link2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate max-w-md">{result.url}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {(result.similarity * 100).toFixed(0)}% match
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/${result.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xl font-semibold text-primary hover:underline"
                        >
                          go/{result.shortCode}
                        </a>
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground transition-colors hover:text-primary"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      {result.description && (
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {result.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {result.visits} visits
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Added {timeAgo(result.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="text"
                        size="icon"
                        className="h-8 w-8 text-on-surface-variant hover:text-primary"
                        onClick={() =>
                          copyToClipboard(`go/${result.shortCode}`)
                        }
                        aria-label={`Copy go/${result.shortCode}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Link href={`/-/links/${result.id}`}>
                        <Button variant="outlined" size="sm" className="h-8">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

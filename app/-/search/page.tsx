"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Search, Link2, Copy, BarChart3, Clock, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

type SearchResult = {
  id: number
  url: string
  shortCode: string
  description: string | null
  visits: number
  createdAt: string
  similarity: number
}

const searchSchema = z.object({
  query: z.string().min(1, "Please enter a search term"),
})

function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>}>
      <SearchPageContent />
    </Suspense>
  )
}

function SearchPageContent() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [lastSearchedQuery, setLastSearchedQuery] = useState("")

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "",
    },
  })

  const searchParams = useSearchParams()

  const performSearch = useCallback(async (query: string) => {
    setLoading(true)
    setSearched(true)
    setLastSearchedQuery(query)
    try {
      const res = await fetch(`/-/api/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (error) {
      console.error("Search failed", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const onSubmit = (values: z.infer<typeof searchSchema>) => {
    performSearch(values.query)
  }

  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      form.setValue("query", query)
      performSearch(query)
    }
  }, [searchParams, performSearch, form])

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors overflow-hidden relative">
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-8 pt-10">

          {/* Header & Search Bar */}
          <div className="space-y-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight">Search Links</h1>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="relative max-w-xl mx-auto">
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
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
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
                No results found for "{lastSearchedQuery}".
              </div>
            ) : (
              results.map((result) => (
                <Card key={result.id} className="border-none bg-surface-container-low/50 hover:bg-surface-container-high/50 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                        <Link2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <Link href={`/${result.shortCode}`} target="_blank" className="text-xl font-semibold text-primary hover:underline truncate block">
                            go/{result.shortCode}
                          </Link>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground bg-surface-container px-2 py-1 rounded-md">
                              {(result.similarity * 100).toFixed(0)}% match
                            </span>
                            <Button variant="text" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => {
                              navigator.clipboard.writeText(`go/${result.shortCode}`)
                              alert("Copied to clipboard!")
                            }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{result.url}</p>
                        {result.description && (
                          <p className="text-sm text-on-surface-variant line-clamp-2 mt-2">{result.description}</p>
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
  )
}

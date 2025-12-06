"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ArrowLeft, ExternalLink, MoreVertical } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  // Mock results based on query
  const results = [
    {
      title: "Engineering Handbook",
      url: "https://wiki.company.com/engineering/handbook",
      description: "The definitive guide to engineering practices, standards, and workflows at our company.",
      tags: ["wiki", "engineering", "docs"]
    },
    {
      title: "Q4 Roadmap",
      url: "https://docs.google.com/presentation/d/roadmap-q4",
      description: "Product and engineering roadmap for Q4 2025. Includes key milestones and deliverables.",
      tags: ["slides", "planning", "q4"]
    },
    {
      title: "Design System (M3)",
      url: "https://m3.material.io",
      description: "Material Design 3 guidelines, components, and resources for building beautiful UIs.",
      tags: ["design", "resources", "external"]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-container/80 backdrop-blur-md border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/">
            <Button variant="text" size="icon" className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1 max-w-2xl relative">
            <Input
              defaultValue={query}
              className="h-10 rounded-full bg-surface-container-highest border-none focus-visible:ring-1"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          <div className="w-10" /> {/* Spacer for balance */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-error font-medium">No exact match found for "{query}"</p>
          <h2 className="text-2xl font-normal text-on-surface">
            Did you mean...
          </h2>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <Card key={index} variant="outlined" className="group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${new URL(result.url).hostname}`}
                        alt=""
                        className="w-4 h-4 rounded-full opacity-70"
                      />
                      {new URL(result.url).hostname}
                    </div>
                    <Link href={result.url} className="block group-hover:underline decoration-primary">
                      <CardTitle className="text-xl text-primary font-medium">
                        {result.title}
                      </CardTitle>
                    </Link>
                  </div>
                  <Button variant="text" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-on-surface-variant leading-relaxed">
                  {result.description}
                </p>
                <div className="flex gap-2 mt-4">
                  {result.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-surface-container-highest text-xs font-medium text-on-surface-variant">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults />
    </Suspense>
  )
}

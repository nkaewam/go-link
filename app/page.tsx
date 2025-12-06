"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Link2, Plus, Sparkles, Copy, Clock, BarChart3, ArrowRight, Loader2 } from "lucide-react"
// import { useRouter } from "next/navigation"
import Link from "next/link"

const formSchema = z.object({
  destination: z.string().url({
    message: "Please enter a valid URL.",
  }),
  alias: z.string().min(2, {
    message: "Alias must be at least 2 characters.",
  }),
  description: z.string().optional(),
})

type LinkData = {
  id: number
  url: string
  shortCode: string
  visits: number
  createdAt: string
}

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

export default function Home() {
  // const router = useRouter()
  const [recentLinks, setRecentLinks] = useState<LinkData[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchLinks = async () => {
    try {
      const res = await fetch("/-/api/links?limit=4")
      if (res.ok) {
        const data = await res.json()
        setRecentLinks(data.data) // API now returns paginated structure
      }
    } catch (error) {
      console.error("Failed to fetch links", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      alias: "",
      description: "",
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true)
    try {
      const res = await fetch("/-/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: values.destination,
          shortCode: values.alias,
          description: values.description,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        if (res.status === 409) {
          form.setError("alias", { message: "Alias already exists" })
        } else {
          alert("Failed to create link: " + error.error)
        }
        return
      }

      form.reset()
      fetchLinks() // Refresh list
    } catch (error) {
      console.error("Error submitting form", error)
      alert("An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors overflow-hidden relative">

      <main className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-4">

          {/* Top Section: The "Big Bento Card" for Creation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
            {/* Left Side: Form */}
            <Card className="lg:col-span-4 border-none bg-surface-container-high/50 backdrop-blur-xl rounded-3xl overflow-hidden relative group h-full">
              <div className="p-8 md:p-12 bg-surface-container-highest/30 flex flex-col justify-center h-full">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto w-full">
                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-on-surface-variant">Destination</FormLabel>
                          <FormControl>
                            <div className="relative group/input">
                              <Input
                                placeholder="https://google.com"
                                className="pl-10 h-14 rounded-2xl bg-surface-container-highest border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                {...field}
                              />
                              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="alias"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-on-surface-variant">Short Alias</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-medium text-primary font-mono">go/</span>
                              <Input
                                placeholder="roadmap"
                                className="font-mono text-lg h-14 rounded-2xl bg-surface-container-highest border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-on-surface-variant">Description <span className="text-muted-foreground text-xs font-normal ml-1">(Optional)</span></FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Project roadmap and timeline"
                              className="h-14 rounded-2xl bg-surface-container-highest border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button size="lg" className="px-12 w-auto h-18 text-xl font-semibold rounded-full bg-primary hover:bg-primary/90 text-on-primary transition-all" type="submit" disabled={submitting}>
                      {submitting ? <Loader2 className="mr-2 w-8 h-8 animate-spin" /> : <Plus className="mr-2 w-8 h-8" />}
                      {submitting ? "Creating..." : "Create Link"}
                    </Button>
                  </form>
                </Form>
              </div>
            </Card>
            {/* Right Side: Hero/Info */}
            <Card className="lg:col-span-8 border-none bg-surface-container-high/50 backdrop-blur-xl rounded-3xl overflow-hidden relative group h-full">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-tertiary/5 opacity-0 transition-opacity duration-500 pointer-events-none" />
              <div className="p-8 md:p-12 flex flex-col justify-center space-y-6 h-full bg-surface-container-low/50">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container w-fit text-on-secondary-container text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>New Link</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-on-surface leading-[1.1]">
                  Create <br />
                  <span className="text-primary">Short Links</span>
                </h1>
                <p className="text-lg text-on-surface-variant leading-relaxed">
                  Transform long URLs into memorable go links. Organize your workflow with style.
                </p>

                <div className="flex items-center gap-4 text-sm text-on-surface-variant/80 pt-4 mt-auto">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span>Active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics enabled</span>
                  </div>
                </div>
              </div>
            </Card>


          </div>

          {/* Bottom Section: Recently Created */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-semibold text-on-surface flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recently Created
              </h2>
              <Link href="/browse">
                <Button variant="text" size="sm" className="text-primary hover:text-primary/80">
                  View all <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                <div className="col-span-full text-center text-muted-foreground py-10">Loading recent links...</div>
              ) : recentLinks.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground py-10">No links created yet.</div>
              ) : (
                recentLinks.map((link) => (
                  <Card key={link.id} variant="filled" className="group hover:bg-surface-container-high transition-colors cursor-pointer border-none">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                          <Link2 className="w-5 h-5" />
                        </div>
                        <Button variant="text" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary -mr-2 -mt-2" onClick={() => {
                          navigator.clipboard.writeText(`go/${link.shortCode}`)
                          alert("Copied to clipboard!")
                        }}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div>
                        <div className="font-mono text-lg font-medium text-primary truncate">go/{link.shortCode}</div>
                        <div className="text-sm text-muted-foreground truncate">{link.url}</div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-outline-variant/20 mt-2">
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {link.visits} visits
                        </span>
                        <span>{timeAgo(link.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

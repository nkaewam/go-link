"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Copy, Trash2, Edit2, Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"

type LinkData = {
  id: number
  url: string
  shortCode: string
  visits: number
  createdAt: string
  owner: string | null
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

export default function BrowsePage() {
  const [links, setLinks] = useState<LinkData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch("/-/api/links")
        if (res.ok) {
          const data = await res.json()
          setLinks(data)
        }
      } catch (error) {
        console.error("Failed to fetch links", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLinks()
  }, [])

  const filteredLinks = links.filter(link =>
    link.shortCode.toLowerCase().includes(search.toLowerCase()) ||
    link.url.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Browse Links</h1>
          <p className="text-on-surface-variant mt-1">Manage and view all your go links</p>
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

      <Card className="border-none bg-surface-container-low overflow-hidden rounded-3xl">
        <Table>
          <TableHeader className="bg-surface-container-highest/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">Alias</TableHead>
              <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">Destination</TableHead>
              <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">Visits</TableHead>
              <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">Created</TableHead>
              <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">Owner</TableHead>
              <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium text-right">Actions</TableHead>
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
            ) : filteredLinks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No links found.
                </TableCell>
              </TableRow>
            ) : (
              filteredLinks.map((link) => (
                <TableRow key={link.id} className="group border-outline-variant/10 hover:bg-surface-container-highest/30">
                  <TableCell className="px-6 py-4 font-medium text-primary font-mono text-base">
                    <a href={`http://localhost:3000/${link.shortCode}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      go/{link.shortCode}
                    </a>
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
                      <Button variant="text" size="icon" className="h-8 w-8 text-on-surface-variant hover:text-primary" onClick={() => {
                        navigator.clipboard.writeText(`http://localhost:3000/${link.shortCode}`)
                        alert("Copied to clipboard!")
                      }}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="text" size="icon" className="h-8 w-8 text-on-surface-variant hover:text-primary">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="text" size="icon" className="h-8 w-8 text-on-surface-variant hover:text-error hover:bg-error/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

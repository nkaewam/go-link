"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Copy, Trash2, Edit2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function BrowsePage() {
  const links = [
    { id: 1, alias: "roadmap", url: "https://linear.app/my-team/roadmap", visits: 124, created: "2h ago", owner: "alice" },
    { id: 2, alias: "standup", url: "https://meet.google.com/abc-defg-hij", visits: 89, created: "1d ago", owner: "bob" },
    { id: 3, alias: "design", url: "https://www.figma.com/file/Mk4...", visits: 456, created: "3d ago", owner: "charlie" },
    { id: 4, alias: "prod-logs", url: "https://datadoghq.com/logs/...", visits: 12, created: "1w ago", owner: "alice" },
    { id: 5, alias: "api-docs", url: "https://docs.api.com/v1/...", visits: 1205, created: "2w ago", owner: "dave" },
    { id: 6, alias: "staging", url: "https://staging.app.com", visits: 56, created: "1mo ago", owner: "eve" },
  ]

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
            <Input placeholder="Search links..." className="pl-9 bg-surface-container-high border-none h-10 rounded-full" />
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
            {links.map((link) => (
              <TableRow key={link.id} className="group border-outline-variant/10 hover:bg-surface-container-highest/30">
                <TableCell className="px-6 py-4 font-medium text-primary font-mono text-base">
                  <a href={`http://go/${link.alias}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    go/{link.alias}
                  </a>
                </TableCell>
                <TableCell className="px-6 py-4 text-on-surface-variant max-w-[300px] truncate">
                  {link.url}
                </TableCell>
                <TableCell className="px-6 py-4 text-on-surface-variant">
                  {link.visits}
                </TableCell>
                <TableCell className="px-6 py-4 text-on-surface-variant">
                  {link.created}
                </TableCell>
                <TableCell className="px-6 py-4 text-on-surface-variant">
                  {link.owner}
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="text" size="icon" className="h-8 w-8 text-on-surface-variant hover:text-primary">
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
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

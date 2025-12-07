"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, Copy, BarChart3 } from "lucide-react";
import { timeAgo, copyToClipboard } from "@/lib/utils";
import type { LinkData } from "@/lib/api/links";

interface LinkCardProps {
  link: LinkData;
}

export function LinkCard({ link }: LinkCardProps) {
  return (
    <Card
      variant="filled"
      className="group hover:bg-surface-container-high transition-colors cursor-pointer border-none"
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <Link2 className="w-5 h-5" />
          </div>
          <Button
            variant="text"
            size="icon"
            className="h-8 w-8 text-on-surface-variant hover:text-primary -mr-2 -mt-2"
            onClick={() => copyToClipboard(`go/${link.shortCode}`)}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <div>
          <div className="font-mono text-lg font-medium text-primary truncate">
            go/{link.shortCode}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {link.url}
          </div>
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
  );
}


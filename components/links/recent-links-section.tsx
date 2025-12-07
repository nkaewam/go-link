"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { LinkCard, type LinkData } from "./link-card";

interface RecentLinksSectionProps {
  links: LinkData[];
  loading: boolean;
}

export function RecentLinksSection({ links, loading }: RecentLinksSectionProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-semibold text-on-surface flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Recently Created
        </h2>
        <Link href="/browse">
          <Button
            variant="text"
            size="sm"
            className="text-primary hover:text-primary/80"
          >
            View all <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {loading ? (
          <div className="col-span-full text-center text-muted-foreground py-10">
            Loading recent links...
          </div>
        ) : links.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-10">
            No links created yet.
          </div>
        ) : (
          links.map((link) => <LinkCard key={link.id} link={link} />)
        )}
      </div>
    </div>
  );
}


"use client";

import { Card } from "@/components/ui/card";
import { Sparkles, BarChart3 } from "lucide-react";

export function HeroSection() {
  return (
    <Card className="lg:col-span-8 border-none bg-surface-container-high/50 backdrop-blur-xl rounded-3xl overflow-hidden relative group h-full">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-tertiary/5 opacity-0 transition-opacity duration-500 pointer-events-none" />
      <div className="p-8 md:p-12 flex flex-col justify-center space-y-6 h-full bg-surface-container-low/50">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container w-fit text-on-secondary-container text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>New Link</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-on-surface leading-[1.1]">
          go<span className="text-primary">/</span>
        </h1>
        <p className="text-lg text-on-surface-variant leading-relaxed">
          Transform long URLs into memorable go links. Organize your workflow
          with style. <br />
          Create with of hate of remembering things by nkaewam@
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
  );
}

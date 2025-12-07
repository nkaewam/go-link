"use client";

import {
  LinkCreationForm,
  HeroSection,
  RecentLinksSection,
} from "@/components/links";
import { useRecentLinks, useCreateLink } from "@/lib/hooks/use-links";

export default function Home() {
  const { data: recentLinks = [], isLoading: loading } = useRecentLinks(4);
  const createLinkMutation = useCreateLink();

  async function handleSubmit(values: {
    destination: string;
    alias: string;
    description?: string;
  }) {
    await createLinkMutation.mutateAsync({
      url: values.destination,
      shortCode: values.alias,
      description: values.description,
    });
  }

  function handleError(error: Error) {
    alert(error.message);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors overflow-hidden relative">
      <main className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-4">
          {/* Top Section: The "Big Bento Card" for Creation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
            <LinkCreationForm
              onSubmit={handleSubmit}
              submitting={createLinkMutation.isPending}
              onError={handleError}
            />
            <HeroSection />
          </div>

          {/* Bottom Section: Recently Created */}
          <RecentLinksSection links={recentLinks} loading={loading} />
        </div>
      </main>
    </div>
  );
}

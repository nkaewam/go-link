"use client";

import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Copy,
  ExternalLink,
  Edit2,
  ArrowLeft,
  Calendar,
  User,
  BarChart3,
  Loader2,
  Link2,
} from "lucide-react";
import { useLink, useLinkAnalytics } from "@/lib/hooks/use-links";
import { timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { EditLinkDialog } from "@/components/links/edit-link-dialog";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function LinkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [editingLink, setEditingLink] = useState<any>(null);

  const { data: link, isLoading: linkLoading } = useLink(id);
  const { data: analytics, isLoading: analyticsLoading } = useLinkAnalytics(
    id,
    range
  );

  const chartConfig = {
    visits: {
      label: "Visits",
      color: "#9e86ff",
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    if (!analytics?.dailyVisits) return [];
    return analytics.dailyVisits.map((day) => ({
      date: new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      visits: day.count,
      fullDate: day.date,
    }));
  }, [analytics]);

  if (linkLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-on-surface-variant">Loading link details...</p>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-on-surface mb-2">
            Link not found
          </h1>
          <Button onClick={() => router.back()} variant="outlined">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="text"
          size="icon"
          onClick={() => router.back()}
          className="h-10 w-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-on-surface">Link Details</h1>
          <p className="text-on-surface-variant mt-1">
            View analytics and manage your go link
          </p>
        </div>
      </div>

      {/* Link Info Card */}
      <Card className="border-none bg-surface-container-low overflow-hidden rounded-3xl p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary font-mono">
                    go/{link.shortCode}
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {link.url}
                  </p>
                </div>
              </div>
              {link.description && (
                <p className="text-on-surface-variant mt-3 pl-11">
                  {link.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                size="sm"
                onClick={() => copyToClipboard(`go/${link.shortCode}`)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => setEditingLink(link)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => window.open(link.url, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-outline-variant/10">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-on-surface-variant">Total Visits</p>
                <p className="text-lg font-semibold text-on-surface">
                  {link.visits}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-on-surface-variant">Created</p>
                <p className="text-lg font-semibold text-on-surface">
                  {timeAgo(link.createdAt)}
                </p>
              </div>
            </div>
            {"updatedAt" in link && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-on-surface-variant">
                    Last Updated
                  </p>
                  <p className="text-lg font-semibold text-on-surface">
                    {timeAgo(link.updatedAt)}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-on-surface-variant">Owner</p>
                <p className="text-lg font-semibold text-on-surface">
                  {link.owner || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Analytics Card */}
      <Card className="border-none bg-surface-container-low overflow-hidden rounded-3xl p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-on-surface">Activity</h2>
            <div className="flex items-center gap-2">
              <Button
                variant={range === "7d" ? "filled" : "outlined"}
                size="sm"
                onClick={() => setRange("7d")}
              >
                7d
              </Button>
              <Button
                variant={range === "30d" ? "filled" : "outlined"}
                size="sm"
                onClick={() => setRange("30d")}
              >
                30d
              </Button>
              <Button
                variant={range === "90d" ? "filled" : "outlined"}
                size="sm"
                onClick={() => setRange("90d")}
              >
                90d
              </Button>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : analytics && analytics.dailyVisits.length > 0 ? (
            <div className="space-y-4">
              {/* Chart */}
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value, index) => {
                      // Show every nth label based on data length
                      const step = Math.ceil(chartData.length / 7);
                      return index % step === 0 ? value : "";
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value, payload) => {
                          if (payload && payload[0]) {
                            const fullDate = payload[0].payload.fullDate;
                            return new Date(fullDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            );
                          }
                          return value;
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="visits"
                    fill="var(--color-visits)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>

              {/* Summary */}
              <div className="text-sm text-on-surface-variant">
                <p>
                  Showing visits for the last {range} (
                  {analytics.dailyVisits.reduce(
                    (sum, day) => sum + day.count,
                    0
                  )}{" "}
                  total visits)
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-on-surface-variant">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No visit data available for this period</p>
            </div>
          )}
        </div>
      </Card>

      {editingLink && (
        <EditLinkDialog
          link={editingLink}
          open={!!editingLink}
          onOpenChange={(open) => {
            if (!open) {
              setEditingLink(null);
            }
          }}
        />
      )}
    </div>
  );
}

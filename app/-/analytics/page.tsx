"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangeSelector } from "@/components/ui/date-range-selector";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Loader2,
  ExternalLink,
  Link2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useMemo } from "react";
import {
  useTopLinks,
  useLowUsageLinks,
  useAggregatedClicks,
} from "@/lib/hooks/use-links";
import { timeAgo } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function AnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");

  const {
    data: topLinksData,
    isLoading: topLinksLoading,
    error: topLinksError,
    isError: isTopLinksError,
    refetch: refetchTopLinks,
  } = useTopLinks(10, range);
  const {
    data: lowUsageData,
    isLoading: lowUsageLoading,
    error: lowUsageError,
    isError: isLowUsageError,
    refetch: refetchLowUsage,
  } = useLowUsageLinks(10, range);
  const {
    data: aggregatedClicksData,
    isLoading: aggregatedClicksLoading,
    error: aggregatedClicksError,
    isError: isAggregatedClicksError,
    refetch: refetchAggregatedClicks,
  } = useAggregatedClicks(range);

  const topLinks = topLinksData?.links ?? [];
  const lowUsageLinks = lowUsageData?.links ?? [];
  const top5Links = topLinks.slice(0, 5);

  const clicksChartConfig = {
    clicks: {
      label: "Clicks",
      color: "#9e86ff",
    },
  } satisfies ChartConfig;

  const topLinksChartConfig = {
    visits: {
      label: "Visits",
      color: "#9e86ff",
    },
  } satisfies ChartConfig;

  const clicksChartData = useMemo(() => {
    if (!aggregatedClicksData?.dailyClicks) return [];
    return aggregatedClicksData.dailyClicks.map((day) => ({
      date: new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      clicks: day.count,
      fullDate: day.date,
    }));
  }, [aggregatedClicksData]);

  const top5ChartData = useMemo(() => {
    return top5Links.map((link) => ({
      alias:
        link.shortCode.length > 15
          ? `${link.shortCode.substring(0, 15)}...`
          : link.shortCode,
      visits: link.visitsInRange,
      fullAlias: link.shortCode,
    }));
  }, [top5Links]);

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      // Extract a user-friendly message
      const message = error.message;
      if (message.includes("400")) {
        return "Invalid request. Please check your parameters.";
      }
      if (message.includes("401")) {
        return "Authentication required.";
      }
      if (message.includes("403")) {
        return "You don't have permission to access this resource.";
      }
      if (message.includes("404")) {
        return "Resource not found.";
      }
      if (
        message.includes("500") ||
        message.includes("502") ||
        message.includes("503")
      ) {
        return "Server error. Please try again later.";
      }
      return message;
    }
    return "An unexpected error occurred";
  };

  const isClientError = (error: unknown): boolean => {
    // Check if it's a 4xx error
    if (error instanceof Error) {
      const status = (error as any).status;
      if (status) {
        return status >= 400 && status < 500;
      }
      // Fallback to message parsing
      return (
        error.message.includes("400") ||
        error.message.includes("401") ||
        error.message.includes("403") ||
        error.message.includes("404")
      );
    }
    return false;
  };

  return (
    <div className="p-4 space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link2 className="relative top-1 w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-primary">go/-/analytics</h1>
          </div>
          <p className="text-on-surface-variant mt-1">
            Discover popular links and identify low-usage links
          </p>
        </div>
        <DateRangeSelector value={range} onChange={setRange} />
      </div>

      {/* Bento Grid with Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* First Bento: Line Chart of Aggregated Clicks */}
        <Card className="border-none bg-surface-container-low overflow-hidden rounded-3xl">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">
                  Aggregated Clicks
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Total clicks over the last {range}
                </p>
              </div>
            </div>

            {aggregatedClicksLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : isAggregatedClicksError ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-3 rounded-full bg-error/10 text-error">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-on-surface mb-1">
                      {isClientError(aggregatedClicksError)
                        ? "Failed to load clicks data"
                        : "Server error"}
                    </h3>
                    <p className="text-sm text-on-surface-variant mb-4">
                      {getErrorMessage(aggregatedClicksError)}
                    </p>
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={() => refetchAggregatedClicks()}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try again
                    </Button>
                  </div>
                </div>
              </div>
            ) : clicksChartData.length > 0 ? (
              <div className="space-y-4">
                <ChartContainer
                  config={clicksChartConfig}
                  className="h-64 w-full"
                >
                  <LineChart
                    accessibilityLayer
                    data={clicksChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      stroke="rgba(255, 255, 255, 0.1)"
                    />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tickFormatter={(value, index) => {
                        const step = Math.ceil(clicksChartData.length / 7);
                        return index % step === 0 ? value : "";
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tickFormatter={(value) => value.toString()}
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
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="var(--color-clicks)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
                <div className="text-sm text-on-surface-variant">
                  <p>Total: {aggregatedClicksData?.totalClicks || 0} clicks</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-on-surface-variant">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No click data available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Second Bento: Bar Chart of Top 5 Links */}
        <Card className="border-none bg-surface-container-low overflow-hidden rounded-3xl">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">
                  Top 5 Links
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Most visited links in the last {range}
                </p>
              </div>
            </div>

            {topLinksLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : isTopLinksError ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-3 rounded-full bg-error/10 text-error">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-on-surface mb-1">
                      {isClientError(topLinksError)
                        ? "Failed to load top links"
                        : "Server error"}
                    </h3>
                    <p className="text-sm text-on-surface-variant mb-4">
                      {getErrorMessage(topLinksError)}
                    </p>
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={() => refetchTopLinks()}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try again
                    </Button>
                  </div>
                </div>
              </div>
            ) : top5ChartData.length > 0 ? (
              <div className="space-y-4">
                <ChartContainer
                  config={topLinksChartConfig}
                  className="h-64 w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={top5ChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      stroke="rgba(255, 255, 255, 0.1)"
                    />
                    <XAxis
                      dataKey="alias"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tickFormatter={(value) => value.toString()}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value, payload) => {
                            if (payload && payload[0]) {
                              return `go/${payload[0].payload.fullAlias}`;
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
              </div>
            ) : (
              <div className="text-center py-12 text-on-surface-variant">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No links found</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Top Links Section */}
      <Card className="border-none bg-surface-container-low overflow-hidden rounded-3xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Top Links</h2>
              <p className="text-sm text-on-surface-variant">
                Most visited links in the last {range}
              </p>
            </div>
          </div>

          {topLinksLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : isTopLinksError ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 rounded-full bg-error/10 text-error">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-on-surface mb-1">
                    {isClientError(topLinksError)
                      ? "Failed to load top links"
                      : "Server error"}
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-4">
                    {getErrorMessage(topLinksError)}
                  </p>
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => refetchTopLinks()}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          ) : topLinks.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No links found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-surface-container-highest/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                      Alias
                    </TableHead>
                    <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                      Destination
                    </TableHead>
                    <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                      Visits ({range})
                    </TableHead>
                    <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                      Total Visits
                    </TableHead>
                    <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                      Owner
                    </TableHead>
                    <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                      Created
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topLinks.map((link) => (
                    <TableRow
                      key={link.id}
                      className="group border-outline-variant/10 hover:bg-surface-container-highest/30"
                    >
                      <TableCell className="px-6 py-4 font-medium text-primary font-mono text-base">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/-/links/${link.id}`}
                            className="hover:underline"
                          >
                            go/{link.shortCode}
                          </Link>
                          <a
                            href={`/${link.shortCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-on-surface-variant hover:text-primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-on-surface-variant max-w-[300px] truncate">
                        {link.url}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="font-semibold text-on-surface">
                          {link.visitsInRange}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-on-surface-variant">
                        {link.totalVisits}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-on-surface-variant">
                        {link.owner || "-"}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-on-surface-variant">
                        {timeAgo(link.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      {/* Rising Links Section */}
      <Card className="border-none bg-surface-container-low overflow-hidden rounded-3xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">
                Rising Links
              </h2>
              <p className="text-sm text-on-surface-variant">
                Recently created links gaining traction
              </p>
            </div>
          </div>

          {topLinksLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : isTopLinksError ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 rounded-full bg-error/10 text-error">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-on-surface mb-1">
                    {isClientError(topLinksError)
                      ? "Failed to load rising links"
                      : "Server error"}
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-4">
                    {getErrorMessage(topLinksError)}
                  </p>
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => refetchTopLinks()}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-surface-container-highest/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                      Alias
                    </TableHead>
                    <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                      Destination
                    </TableHead>
                    <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                      Visits ({range})
                    </TableHead>
                    <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                      Created
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topLinks
                    .filter((link) => {
                      // Filter for links created in the last 30 days with recent visits
                      const createdAt = new Date(link.createdAt);
                      const daysSinceCreation =
                        (Date.now() - createdAt.getTime()) /
                        (1000 * 60 * 60 * 24);
                      return daysSinceCreation <= 30 && link.visitsInRange > 0;
                    })
                    .slice(0, 5)
                    .map((link) => (
                      <TableRow
                        key={link.id}
                        className="group border-outline-variant/10 hover:bg-surface-container-highest/30"
                      >
                        <TableCell className="px-6 py-4 font-medium text-primary font-mono text-base">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/-/links/${link.id}`}
                              className="hover:underline"
                            >
                              go/{link.shortCode}
                            </Link>
                            <a
                              href={`/${link.shortCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-on-surface-variant hover:text-primary"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-on-surface-variant max-w-[300px] truncate">
                          {link.url}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="font-semibold text-on-surface">
                            {link.visitsInRange}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-on-surface-variant">
                          {timeAgo(link.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  {topLinks.filter((link) => {
                    const createdAt = new Date(link.createdAt);
                    const daysSinceCreation =
                      (Date.now() - createdAt.getTime()) /
                      (1000 * 60 * 60 * 24);
                    return daysSinceCreation <= 30 && link.visitsInRange > 0;
                  }).length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No rising links found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      {/* Low Usage Links Section */}
      <Card className="border-none bg-surface-container-low overflow-hidden rounded-3xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-error/10 text-error">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">
                Low Usage Links
              </h2>
              <p className="text-sm text-on-surface-variant">
                Links with few or no visits in the last {range}
              </p>
            </div>
          </div>

          {lowUsageLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : isLowUsageError ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 rounded-full bg-error/10 text-error">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-on-surface mb-1">
                    {isClientError(lowUsageError)
                      ? "Failed to load low usage links"
                      : "Server error"}
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-4">
                    {getErrorMessage(lowUsageError)}
                  </p>
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => refetchLowUsage()}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          ) : lowUsageLinks.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No low usage links found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-surface-container-highest/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                      Alias
                    </TableHead>
                    <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                      Destination
                    </TableHead>
                    <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                      Visits ({range})
                    </TableHead>
                    <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                      Total Visits
                    </TableHead>
                    <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                      Owner
                    </TableHead>
                    <TableHead className="h-12 px-6 text-on-surface-variant uppercase text-xs font-medium">
                      Created
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowUsageLinks.map((link) => (
                    <TableRow
                      key={link.id}
                      className="group border-outline-variant/10 hover:bg-surface-container-highest/30"
                    >
                      <TableCell className="px-6 py-4 font-medium text-primary font-mono text-base">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/-/links/${link.id}`}
                            className="hover:underline"
                          >
                            go/{link.shortCode}
                          </Link>
                          <a
                            href={`/${link.shortCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-on-surface-variant hover:text-primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-on-surface-variant max-w-[300px] truncate">
                        {link.url}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="font-semibold text-on-surface">
                          {link.visitsInRange}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-on-surface-variant">
                        {link.totalVisits}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-on-surface-variant">
                        {link.owner || "-"}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-on-surface-variant">
                        {timeAgo(link.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

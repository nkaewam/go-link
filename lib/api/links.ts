export type LinkData = {
  id: number;
  url: string;
  shortCode: string;
  visits: number;
  createdAt: string;
  owner?: string | null;
  description?: string | null;
};

export type PaginationData = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type LinksResponse = {
  data: LinkData[];
  pagination: PaginationData;
};

export type CreateLinkParams = {
  url: string;
  shortCode: string;
  description?: string;
};

export type UpdateLinkParams = {
  url?: string;
  shortCode?: string;
  description?: string;
};

export type SearchResult = {
  id: number;
  url: string;
  shortCode: string;
  description: string | null;
  visits: number;
  createdAt: string;
  similarity: number;
};

/**
 * Fetch recent links with a limit
 */
export async function fetchRecentLinks(limit: number = 4): Promise<LinkData[]> {
  const res = await fetch(`/-/api/links?limit=${limit}`);
  if (!res.ok) {
    throw new Error("Failed to fetch recent links");
  }
  const data: LinksResponse = await res.json();
  return data.data;
}

/**
 * Fetch paginated links with optional search
 */
export async function fetchLinks(
  page: number = 1,
  limit: number = 10,
  search: string = ""
): Promise<LinksResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  const res = await fetch(`/-/api/links?${params}`);
  if (!res.ok) {
    throw new Error("Failed to fetch links");
  }
  return res.json();
}

/**
 * Create a new link
 */
export async function createLink(
  params: CreateLinkParams
): Promise<LinkData> {
  const res = await fetch("/-/api/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: params.url,
      shortCode: params.shortCode,
      description: params.description,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    if (res.status === 409) {
      throw new Error("Alias already exists");
    }
    throw new Error(error.error || "Failed to create link");
  }

  return res.json();
}

/**
 * Update an existing link
 */
export async function updateLink(
  id: number,
  params: UpdateLinkParams
): Promise<LinkData> {
  const res = await fetch(`/-/api/links/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: params.url,
      shortCode: params.shortCode,
      description: params.description,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    if (res.status === 409) {
      throw new Error("Alias already exists");
    }
    if (res.status === 404) {
      throw new Error("Link not found");
    }
    throw new Error(error.error || "Failed to update link");
  }

  return res.json();
}

/**
 * Search links semantically
 */
export async function searchLinks(query: string): Promise<SearchResult[]> {
  const res = await fetch(`/-/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error("Search failed");
  }
  return res.json();
}

/**
 * Fetch a single link by ID
 */
export async function fetchLink(id: number): Promise<LinkData & { updatedAt: string }> {
  const res = await fetch(`/-/api/links/${id}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Link not found");
    }
    throw new Error("Failed to fetch link");
  }
  return res.json();
}

export type AnalyticsData = {
  linkId: number;
  range: string;
  totalVisits: number;
  dailyVisits: Array<{
    date: string;
    count: number;
  }>;
};

export type TopLinkData = LinkData & {
  updatedAt: string;
  totalVisits: number;
  visitsInRange: number;
};

export type TopLinksResponse = {
  links: TopLinkData[];
  range: string;
  limit: number;
};

/**
 * Fetch analytics for a link
 */
export async function fetchLinkAnalytics(
  id: number,
  range: "7d" | "30d" | "90d" = "30d"
): Promise<AnalyticsData> {
  const res = await fetch(`/-/api/links/${id}/analytics?range=${range}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Link not found");
    }
    throw new Error("Failed to fetch analytics");
  }
  return res.json();
}

/**
 * Fetch top links by visits in a time range
 */
export async function fetchTopLinks(
  limit: number = 10,
  range: "7d" | "30d" | "90d" = "30d"
): Promise<TopLinksResponse> {
  const res = await fetch(
    `/-/api/analytics/top-links?limit=${limit}&range=${range}`
  );
  if (!res.ok) {
    const error = new Error(`Failed to fetch top links: ${res.status}`);
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
}

/**
 * Fetch low usage links (links with few or no visits in a time range)
 */
export async function fetchLowUsageLinks(
  limit: number = 10,
  range: "7d" | "30d" | "90d" = "30d"
): Promise<TopLinksResponse> {
  const res = await fetch(
    `/-/api/analytics/low-usage-links?limit=${limit}&range=${range}`
  );
  if (!res.ok) {
    const error = new Error(`Failed to fetch low usage links: ${res.status}`);
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
}

export type AggregatedClicksData = {
  range: string;
  dailyClicks: Array<{
    date: string;
    count: number;
  }>;
  totalClicks: number;
};

/**
 * Fetch aggregated clicks over time
 */
export async function fetchAggregatedClicks(
  range: "7d" | "30d" | "90d" = "30d"
): Promise<AggregatedClicksData> {
  const res = await fetch(
    `/-/api/analytics/aggregated-clicks?range=${range}`
  );
  if (!res.ok) {
    const error = new Error(`Failed to fetch aggregated clicks: ${res.status}`);
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
}


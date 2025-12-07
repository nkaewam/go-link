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


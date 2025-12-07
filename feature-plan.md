## Feature Plan

This document outlines the next set of features to implement, in priority order. Each section includes goals, user stories, and a rough breakdown of backend, frontend, and data work.

---

## 1. Link Editing

**Goal:** Allow users to update existing links (URL, description, and optionally alias) from the UI, with safe validation.

**User stories**
- As a user, I can open an edit form for a link from the browse table.
- As a user, I can update the destination URL and description of a link.
- As a user, I get a clear error if I try to change an alias to one that already exists.
- As a user, I see updated data reflected immediately after saving.

**Backend**
- Add an API route for updating a link:
  - `PATCH /-/api/links/:id`
  - Body: `{ url?: string; shortCode?: string; description?: string }`
  - Validation:
    - URL must still be a valid URL.
    - `shortCode` rules must match creation (`no "/"`, not starting with `"-"`, min length, uniqueness).
  - Behavior:
    - Fetch existing link by `id`.
    - If `shortCode` changed, check for conflicts.
    - Update `updatedAt` timestamp.
    - Optional: re‑generate embedding if `url`, `shortCode`, or `description` changes.

**Frontend**
- `/-/browse` page:
  - Wire the existing Edit button to open an “Edit Link” modal or inline form.
  - Form fields: `Alias`, `Destination`, `Description`.
  - Populate with current values.
  - On submit:
    - Call PATCH API.
    - Show loading state & non‑blocking success/error feedback (toast).
    - Optimistically update the list via React Query (or refetch).

**Data / other**
- Consider whether to restrict who can edit (current assumption: anyone can).
- Decide whether editing should re‑embed vectors or not (trade‑off: accuracy vs. performance).

---

## 2. Per‑Link Detailed View & Click‑Through Analytics

**Goal:** Provide a dedicated detail view for each link with richer information and basic usage analytics.

**User stories**
- As a user, I can click a link from browse/search to see a details page.
- As a user, I can see when the link was created, last updated, and how many visits it has.
- As a user, I can see a small chart or timeline of visits over time.

**Backend**
- Link detail:
  - API: `GET /-/api/links/:id`
    - Returns full record for a single link.
- Click‑through tracking:
  - Ensure redirect route (`/[short_code]/route.ts`) increments `visits`.
  - Extend analytics:
    - New `link_visits` table:
      - `id`, `linkId`, `visitedAt` (timestamp), optional `userId`/`owner`/`referrer`.
    - On redirect, insert a row into `link_visits`.
- Link analytics API:
  - `GET /-/api/links/:id/analytics?range=7d|30d|90d`
    - Returns aggregated counts, e.g., visits per day for the selected range.

**Frontend**
- New page: `/-/links/[id]/page.tsx`:
  - Header with `go/alias`, destination URL, description.
  - Metadata: owner, createdAt, updatedAt, total visits.
  - Section: “Activity” with a small chart (visits per day) or simple bar/line chart.
  - Actions: “Copy go link”, “Edit link” (reuse editing flow), “Open destination”.
- Navigation:
  - From `/‑/browse`:
    - Make alias clickable or add a “View details” action that links to `/-/links/[id]`.
  - From `/‑/search`:
    - Add a “Details” link/button on each result card.

**Data / other**
- Decide minimal analytics granularity (per visit row vs. aggregated counters).
- Think about data retention windows (e.g., keep per‑visit rows for 90 days).

---

## 3. Better Copy Experience

**Goal:** Replace blocking `alert()` calls with a modern, non‑disruptive copy experience and consistent UX across the app.

**User stories**
- As a user, I can copy `go/alias` from any screen with a single click.
- As a user, I get a small toast/snackbar confirming that the link was copied, without blocking my workflow.

**Backend**
- No backend changes required.

**Frontend**
- Introduce a shared copy helper:
  - Utility function: `copyToClipboard(text: string): Promise<boolean>` that wraps `navigator.clipboard.writeText` and handles errors.
- Toast/notification system:
  - Use (or add) a simple toast provider and hook (e.g., from Shadcn or custom) to display success/error messages.
- Replace existing copy patterns:
  - In `/-/browse`: replace `alert("Copied to clipboard!")` with a toast.
  - In `/-/search`: do the same for the copy button on results.
  - On link detail page: primary copy button uses same helper + toast.
- UX details:
  - Make the copy icon visually consistent (same size, color, hover state) across pages.

**Data / other**
- Optional: log copy events in analytics later (e.g., for “most copied links”).

---

## 4. Top Links Dashboard

**Goal:** Provide a high‑level dashboard showing the most popular and recently active links to aid discovery and maintenance.

**User stories**
- As a user, I can see the top N most visited links over a chosen time window.
- As a user, I can see “rising” links (recently created, quickly gaining visits).
- As an admin/power user, I can see links that are rarely or never used, to consider cleanup.

**Backend**
- Aggregated stats:
  - Using `links.visits` (global total) plus `link_visits` (time‑series) if implemented.
- APIs:
  - `GET /-/api/analytics/top-links?limit=10&range=30d`
    - Returns links ordered by number of visits in the range.
  - Optional: `GET /-/api/analytics/low-usage-links?limit=10&range=30d`
    - Returns links with 0 or very few visits in the range.
- Implement queries in Drizzle:
  - Aggregate over `link_visits` by `linkId` and date range.
  - Join with `links` to get metadata for display.

**Frontend**
- New page: `/-/analytics/page.tsx`:
  - Sections:
    - “Top Links” (table or cards with alias, URL, owner, visits in range, total visits).
    - “Rising Links” (recently created + high recent visit count).
    - “Low Usage Links” (optional).
  - Filters:
    - Time range selector: 7d / 30d / 90d.
  - Interactions:
    - Clicking a row navigates to the per‑link detail page.

**Data / other**
- Ensure `link_visits` table is populated before relying on time‑based analytics.
- Consider performance of aggregation queries as data grows (indexes on `linkId`, `visitedAt`).

---

## 5. Search Filters + Advanced Search

**Goal:** Enhance semantic search with filters (owner, tags, date range, popularity) and optional keyword search to narrow results.

**User stories**
- As a user, I can filter search results by owner or team.
- As a user, I can restrict search to links created within a specific date range.
- As a user, I can search for links using both semantic meaning and exact text filters.

**Backend**
- Data model:
  - Consider adding `tags` support if not present:
    - Either a `tags` text array on `links`, or a `link_tags` join table.
- Search API changes (`/-/api/search`):
  - Additional query parameters:
    - `owner`, `tags[]`, `createdFrom`, `createdTo`, maybe `minVisits`.
  - Behavior:
    - Continue to embed `q` for semantic similarity.
    - Apply SQL filters (owner, tags, date range, minVisits) in the query that selects candidates.
    - Keep the similarity ordering for the final list.

**Frontend**
- `/-/search` page:
  - Add filter controls above or beside the search bar:
    - Owner dropdown or free‑text (depending on auth design).
    - Date range picker (from/to or quick presets).
    - Optional: tag multi‑select.
  - Include filter state in requests to `useSearchLinks`.
  - Push filters to URL query params (so the search is shareable/bookmarkable).
  - Show applied filters in the UI and provide a “Clear filters” action.

**Data / other**
- Decide how owners and tags are managed (free‑text vs. controlled lists).
- Consider auth/permissions if filters depend on user identity.



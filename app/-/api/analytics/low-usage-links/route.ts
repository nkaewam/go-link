import { db } from "@/lib/db"
import { links, linkVisits } from "@/lib/db/schema"
import { NextResponse } from "next/server"
import { sql, gte, asc, and } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const range = searchParams.get("range") || "30d"
    
    // Calculate date threshold based on range
    const now = new Date()
    let daysAgo = 30
    if (range === "7d") {
      daysAgo = 7
    } else if (range === "90d") {
      daysAgo = 90
    }
    
    const thresholdDate = new Date(now)
    thresholdDate.setDate(thresholdDate.getDate() - daysAgo)
    // Convert to ISO string for PostgreSQL timestamp
    const thresholdDateStr = thresholdDate.toISOString()

    // Query links with low or zero usage in the time range
    // Use a subquery approach to properly handle the date filter
    const lowUsageLinks = await db
      .select({
        id: links.id,
        url: links.url,
        shortCode: links.shortCode,
        description: links.description,
        owner: links.owner,
        createdAt: links.createdAt,
        updatedAt: links.updatedAt,
        totalVisits: links.visits,
        visitsInRange: sql<number>`COALESCE((
          SELECT COUNT(*)::int
          FROM ${linkVisits}
          WHERE ${linkVisits.linkId} = ${links.id}
            AND ${linkVisits.visitedAt} >= ${sql.raw(`'${thresholdDateStr}'::timestamp`)}
        ), 0)`.as("visits_in_range"),
      })
      .from(links)
      .groupBy(links.id)
      .orderBy(asc(sql`COALESCE((
        SELECT COUNT(*)::int
        FROM ${linkVisits}
        WHERE ${linkVisits.linkId} = ${links.id}
          AND ${linkVisits.visitedAt} >= ${sql.raw(`'${thresholdDateStr}'::timestamp`)}
      ), 0)`), asc(links.visits))
      .limit(limit)

    return NextResponse.json({
      links: lowUsageLinks,
      range,
      limit,
    })
  } catch (error) {
    console.error("Error fetching low usage links:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


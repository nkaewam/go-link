import { db } from "@/lib/db"
import { links, linkVisits } from "@/lib/db/schema"
import { NextResponse } from "next/server"
import { eq, sql, gte, and } from "drizzle-orm"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const linkId = parseInt(id, 10)
    
    if (isNaN(linkId)) {
      return NextResponse.json({ error: "Invalid link ID" }, { status: 400 })
    }

    // Verify link exists
    const [link] = await db.select().from(links).where(eq(links.id, linkId))
    
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // Get range from query params (default to 30d)
    const { searchParams } = new URL(request.url)
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

    // Query aggregated visits by day
    // Using PostgreSQL date_trunc to group by day
    const dailyVisits = await db
      .select({
        date: sql<string>`DATE(${linkVisits.visitedAt})`.as("date"),
        count: sql<number>`COUNT(*)::int`.as("count"),
      })
      .from(linkVisits)
      .where(
        and(
          eq(linkVisits.linkId, linkId),
          gte(linkVisits.visitedAt, thresholdDate)
        )
      )
      .groupBy(sql`DATE(${linkVisits.visitedAt})`)
      .orderBy(sql`DATE(${linkVisits.visitedAt}) ASC`)

    // Fill in missing days with 0 counts for a complete timeline
    const visitsMap = new Map<string, number>()
    dailyVisits.forEach((item) => {
      visitsMap.set(item.date, item.count)
    })

    // Generate complete date range
    const completeRange: Array<{ date: string; count: number }> = []
    const currentDate = new Date(thresholdDate)
    
    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split("T")[0]
      completeRange.push({
        date: dateStr,
        count: visitsMap.get(dateStr) || 0,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      linkId,
      range,
      totalVisits: link.visits,
      dailyVisits: completeRange,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


import { db } from "@/lib/db"
import { linkVisits } from "@/lib/db/schema"
import { NextResponse } from "next/server"
import { sql, gte } from "drizzle-orm"

export async function GET(request: Request) {
  try {
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
    // Convert to ISO string for PostgreSQL timestamp
    const thresholdDateStr = thresholdDate.toISOString()

    // Query aggregated visits by day
    const dailyClicks = await db
      .select({
        date: sql<string>`DATE(${linkVisits.visitedAt})`.as("date"),
        count: sql<number>`COUNT(*)::int`.as("count"),
      })
      .from(linkVisits)
      .where(gte(linkVisits.visitedAt, sql.raw(`'${thresholdDateStr}'::timestamp`)))
      .groupBy(sql`DATE(${linkVisits.visitedAt})`)
      .orderBy(sql`DATE(${linkVisits.visitedAt}) ASC`)

    // Fill in missing days with 0 counts for a complete timeline
    const clicksMap = new Map<string, number>()
    dailyClicks.forEach((item) => {
      clicksMap.set(item.date, item.count)
    })

    // Generate complete date range
    const completeRange: Array<{ date: string; count: number }> = []
    const currentDate = new Date(thresholdDate)
    
    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split("T")[0]
      completeRange.push({
        date: dateStr,
        count: clicksMap.get(dateStr) || 0,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      range,
      dailyClicks: completeRange,
      totalClicks: completeRange.reduce((sum, day) => sum + day.count, 0),
    })
  } catch (error) {
    console.error("Error fetching aggregated clicks:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


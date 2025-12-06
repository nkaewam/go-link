import { db } from "@/lib/db"
import { links } from "@/lib/db/schema"
import { NextResponse } from "next/server"
import { eq, sql } from "drizzle-orm"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ short_code: string }> }
) {
  const shortCode = (await params).short_code

  try {
    const [link] = await db.select().from(links).where(eq(links.shortCode, shortCode))

    if (!link) {
      // TODO: Redirect to a search page or 404 page
      return NextResponse.redirect(new URL("/-/search?q=" + shortCode, request.url))
    }

    // Increment visits asynchronously (fire and forget)
    // We don't await this to speed up the redirect
    db.update(links)
      .set({ visits: sql`${links.visits} + 1` })
      .where(eq(links.id, link.id))
      .catch((err) => console.error("Error incrementing visits:", err))

    return NextResponse.redirect(link.url)
  } catch (error) {
    console.error("Error redirecting:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

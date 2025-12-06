import { db } from "@/lib/db"
import { links } from "@/lib/db/schema"
import { NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"

const createLinkSchema = z.object({
  url: z.string().url(),
  shortCode: z.string().min(2),
  description: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const result = createLinkSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const { url, shortCode, description } = result.data

    // Check if shortCode already exists
    const existing = await db.select().from(links).where(eq(links.shortCode, shortCode))
    if (existing.length > 0) {
      return NextResponse.json({ error: "Short code already exists" }, { status: 409 })
    }

    const [newLink] = await db.insert(links).values({
      url,
      shortCode,
      description,
    }).returning()

    return NextResponse.json(newLink)
  } catch (error) {
    console.error("Error creating link:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const allLinks = await db.select().from(links).orderBy(desc(links.createdAt))
    return NextResponse.json(allLinks)
  } catch (error) {
    console.error("Error fetching links:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

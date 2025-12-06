import { db } from "@/lib/db"
import { links } from "@/lib/db/schema"
import { NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"
import { pipeline } from "@xenova/transformers"

// Singleton for the embedding pipeline
let extractor: any = null;
async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true,
    });
  }
  return extractor;
}

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

    // Generate embedding
    const pipe = await getExtractor();
    const textToEmbed = `${shortCode} ${url} ${description || ''}`;
    const output = await pipe(textToEmbed, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data) as number[];

    const [newLink] = await db.insert(links).values({
      url,
      shortCode,
      description,
      embedding,
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

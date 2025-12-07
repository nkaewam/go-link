import { db } from "@/lib/db"
import { links } from "@/lib/db/schema"
import { NextResponse } from "next/server"
import { eq, and, ne } from "drizzle-orm"
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

const updateLinkSchema = z.object({
  url: z.string().url().optional(),
  shortCode: z.string().min(2).refine((val) => !val.includes("/") && !val.startsWith("-"), {
    message: "Alias cannot contain '/' or starts with '-'",
  }).optional(),
  description: z.string().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const linkId = parseInt(id, 10)
    
    if (isNaN(linkId)) {
      return NextResponse.json({ error: "Invalid link ID" }, { status: 400 })
    }

    const body = await request.json()
    const result = updateLinkSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const { url, shortCode, description } = result.data

    // Fetch existing link
    const [existingLink] = await db.select().from(links).where(eq(links.id, linkId))
    
    if (!existingLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // If shortCode is being changed, check for conflicts
    if (shortCode && shortCode !== existingLink.shortCode) {
      const conflictingLink = await db.select()
        .from(links)
        .where(
          and(
            eq(links.shortCode, shortCode),
            ne(links.id, linkId)
          )
        )
      
      if (conflictingLink.length > 0) {
        return NextResponse.json({ error: "Short code already exists" }, { status: 409 })
      }
    }

    // Determine final values for embedding generation
    const finalUrl = url !== undefined ? url : existingLink.url
    const finalShortCode = shortCode !== undefined ? shortCode : existingLink.shortCode
    const finalDescription = description !== undefined ? (description || null) : existingLink.description

    // Normalize description for comparison (empty string -> null)
    const normalizedExistingDescription = existingLink.description || null
    const normalizedNewDescription = description !== undefined ? (description || null) : normalizedExistingDescription

    // Check if we need to regenerate embedding (if url, shortCode, or description changed)
    const needsEmbeddingUpdate = 
      (url !== undefined && url !== existingLink.url) ||
      (shortCode !== undefined && shortCode !== existingLink.shortCode) ||
      (description !== undefined && normalizedNewDescription !== normalizedExistingDescription)

    // Build update object
    const updateData: {
      url?: string
      shortCode?: string
      description?: string | null
      embedding?: number[]
      updatedAt?: Date
    } = {
      updatedAt: new Date(),
    }

    if (url !== undefined) {
      updateData.url = url
    }
    if (shortCode !== undefined) {
      updateData.shortCode = shortCode
    }
    if (description !== undefined) {
      updateData.description = description || null
    }

    // Regenerate embedding if any relevant field changed
    if (needsEmbeddingUpdate) {
      const pipe = await getExtractor();
      const textToEmbed = `${finalShortCode} ${finalUrl} ${finalDescription || ''}`;
      const output = await pipe(textToEmbed, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data) as number[];
      updateData.embedding = embedding;
    }

    // Update the link
    const [updatedLink] = await db.update(links)
      .set(updateData)
      .where(eq(links.id, linkId))
      .returning()

    return NextResponse.json(updatedLink)
  } catch (error) {
    console.error("Error updating link:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


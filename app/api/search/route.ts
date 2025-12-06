import { db } from "@/lib/db"
import { links } from "@/lib/db/schema"
import { NextResponse } from "next/server"
import { cosineDistance, desc, gt, sql } from "drizzle-orm"
import { pipeline } from "@xenova/transformers"

// Singleton for the embedding pipeline (shared with links API if possible, but for now duplicated/independent in this file context)
// In a real app, we might move this to a shared lib/utils/embedding.ts
let extractor: any = null;
async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true,
    });
  }
  return extractor;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
    }

    // Generate embedding for the query
    const pipe = await getExtractor();
    const output = await pipe(query, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(output.data) as number[];

    // Perform vector similarity search
    // We use 1 - cosineDistance because cosineDistance returns 0 for identical vectors and 2 for opposite
    // We want similarity score where 1 is identical
    const similarity = sql<number>`1 - (${cosineDistance(links.embedding, queryEmbedding)})`

    const results = await db
      .select({
        id: links.id,
        url: links.url,
        shortCode: links.shortCode,
        description: links.description,
        visits: links.visits,
        createdAt: links.createdAt,
        similarity: similarity,
      })
      .from(links)
      .where(gt(similarity, 0.2)) // Filter out low relevance results
      .orderBy(desc(similarity))
      .limit(10)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error searching links:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

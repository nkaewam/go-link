import { NextResponse } from "next/server";

function resolveUrl(target: string) {
  const hasProtocol = /^https?:\/\//i.test(target);
  return new URL(hasProtocol ? target : `https://${target}`).toString();
}

function extractMetaContent(html: string, name: string) {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const match = html.match(pattern);
  return match?.[1];
}

function normalizeImageUrl(imageUrl: string, baseUrl: string) {
  try {
    return new URL(imageUrl, baseUrl).toString();
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get("url");

    if (!target) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    let normalizedUrl: string;
    try {
      normalizedUrl = resolveUrl(target);
    } catch {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }

    const response = await fetch(normalizedUrl, {
      // Use a browser-like UA to reduce blocking
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch page" },
        { status: response.status }
      );
    }

    const html = await response.text();
    const ogImage =
      extractMetaContent(html, "og:image") ||
      extractMetaContent(html, "twitter:image") ||
      null;

    const resolvedImage = ogImage
      ? normalizeImageUrl(ogImage, normalizedUrl)
      : null;

    return NextResponse.json({ ogImage: resolvedImage });
  } catch (error) {
    console.error("Metadata fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


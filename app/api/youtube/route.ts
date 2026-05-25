import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "philosophy explained";
    const maxResults = searchParams.get("maxResults") || "12";

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${process.env.YOUTUBE_API_KEY}&relevanceLanguage=en&safeSearch=moderate&order=viewCount`;

    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(items: data.items);
  } catch (error) {
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
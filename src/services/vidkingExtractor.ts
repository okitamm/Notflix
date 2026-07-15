// src/services/vidlinkExtractor.ts

export async function extractVidlinkStream(id: number, mediaType: "movie" | "tv", season?: number, episode?: number): Promise<string> {
  try {
    // 1. Construct the Vidlink URL based on your documentation
    const embedUrl = mediaType === "movie" 
      ? `https://vidlink.pro/movie/${id}`
      : `https://vidlink.pro/tv/${id}/${season}/${episode}`;

    console.log(`[VidlinkExtractor] Sneaking into: ${embedUrl}`);

    // 2. Fetch the raw HTML, spoofing a desktop browser
    const response = await fetch(embedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Referer": "https://vidlink.pro/"
      }
    });

    if (!response.ok) throw new Error(`Failed to load Vidlink page. Status: ${response.status}`);

    const html = await response.text();

    // 3. The Hunt: Broadened Regex to catch heavily nested .m3u8 links
    // This catches "url":"https://...", file: 'https://...', or raw unquoted links
    const sourceRegex = /(?:source|file|src|url)\s*[:=]\s*['"](https:\/\/[^'"]+\.(?:m3u8|mp4)[^'"]*)['"]/i;
    const fallbackRegex = /(https:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i;

    let match = html.match(sourceRegex);
    if (!match) match = html.match(fallbackRegex);

    if (match && match[1]) {
      // Clean the URL in case the website escaped the forward slashes (e.g., https:\/\/)
      const cleanUrl = match[1].replace(/\\\//g, '/');
      console.log(`[VidlinkExtractor] Success! Found raw stream:`, cleanUrl);
      return cleanUrl;
    } else {
      throw new Error("Stream URL is heavily encrypted or obfuscated on Vidlink.");
    }
  } catch (error: any) {
    console.log(`[VidlinkExtractor] Extraction failed:`, error.message);
    throw error;
  }
}
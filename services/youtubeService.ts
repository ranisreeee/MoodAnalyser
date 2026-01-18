
/**
 * Search for a video on YouTube using the Data API v3.
 * Requires process.env.YOUTUBE_API_KEY to be set.
 */
export const searchYouTubeSong = async (query: string): Promise<string | null> => {
  let apiKey: string | undefined;
  try {
    apiKey = process.env.YOUTUBE_API_KEY;
  } catch (e) {
    console.warn("process.env not available in this environment.");
  }

  if (!apiKey) {
    console.error("YouTube API Key is missing");
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`
    );
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return `https://www.youtube.com/watch?v=${data.items[0].id.videoId}`;
    }
    return null;
  } catch (error) {
    console.error("YouTube search failed:", error);
    return null;
  }
};

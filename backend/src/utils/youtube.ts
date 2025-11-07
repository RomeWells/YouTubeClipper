// backend/src/utils/youtube.ts

/**
 * Extracts the YouTube video ID from various URL formats.
 * @param url The YouTube URL.
 * @returns The video ID or null if not found.
 */
export const extractVideoId = (url: string): string | null => {
  if (!url) {
    return null;
  }

  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/|shorts\/|playlist\?list=)([\w-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([\w-]{11})/,
    /^([\w-]{11})$/ // Case where just the ID is passed
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

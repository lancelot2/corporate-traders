function requireSerpApiKey() {
  const key = process.env.SERPAPI_KEY;
  if (!key) {
    throw new Error('SERPAPI_KEY must be set in frontend/.env.local.');
  }
  return key;
}

// Returns the first Google Images result exactly as requested. Keep the
// originating page URL as well as the direct image URL for human review.
export async function findFirstGoogleImage(name) {
  const query = new URLSearchParams({
    engine: 'google_images',
    q: name,
    api_key: requireSerpApiKey(),
  });
  const response = await fetch(`https://serpapi.com/search.json?${query}`);
  const payload = await response.json();

  if (!response.ok || payload.error) {
    throw new Error(payload.error || `SerpAPI image search failed for ${name} (${response.status}).`);
  }

  const result = payload.images_results?.[0];
  if (!result?.original) return null;

  return {
    provider: 'serpapi_google_images',
    position: result.position ?? 1,
    title: result.title ?? `${name} — Google Images result`,
    previewUrl: result.thumbnail ?? result.original,
    sourceUrl: result.original,
    sourcePageUrl: result.link ?? null,
    source: result.source ?? null,
    width: result.original_width ?? null,
    height: result.original_height ?? null,
  };
}

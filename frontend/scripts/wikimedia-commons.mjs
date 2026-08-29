function plainText(value = '') {
  return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function scoreCandidate(candidate, name) {
  const words = name.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${candidate.title} ${candidate.description}`.toLowerCase();
  const nameScore = words.reduce((score, word) => score + (haystack.includes(word) ? 10 : 0), 0);
  const dimensions = Math.min(candidate.width * candidate.height / 1_000_000, 20);
  return nameScore + dimensions;
}

// Searches only Wikimedia Commons files and preserves available attribution
// metadata with each candidate for later review and storage.
export async function findHeadshotCandidates(name) {
  const query = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: `${name} portrait`,
    gsrnamespace: '6',
    gsrlimit: '8',
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: '1600',
    iiextmetadatafilter: 'Artist|Credit|LicenseShortName|LicenseUrl|UsageTerms|AttributionRequired|ImageDescription',
    origin: '*',
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${query}`);
  if (!response.ok) throw new Error(`Wikimedia Commons search failed for ${name} (${response.status}).`);
  const payload = await response.json();

  return Object.values(payload.query?.pages ?? {})
    .map((page) => {
      const info = page.imageinfo?.[0];
      const metadata = info?.extmetadata ?? {};
      if (!info?.url || info.mime === 'image/svg+xml') return null;
      return {
        title: page.title,
        previewUrl: info.thumburl ?? info.url,
        sourceUrl: info.url,
        width: info.width,
        height: info.height,
        description: plainText(metadata.ImageDescription?.value),
        artist: plainText(metadata.Artist?.value),
        credit: plainText(metadata.Credit?.value),
        license: plainText(metadata.LicenseShortName?.value),
        licenseUrl: metadata.LicenseUrl?.value ?? null,
        attributionRequired: plainText(metadata.AttributionRequired?.value),
      };
    })
    .filter(Boolean)
    .sort((a, b) => scoreCandidate(b, name) - scoreCandidate(a, name));
}

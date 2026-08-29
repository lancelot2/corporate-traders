import { fal } from '@fal-ai/client';
import { imagePresets } from './image-presets.mjs';
import { findFirstGoogleImage } from './serpapi-google-images.mjs';
import { supabaseAdmin } from './supabase-client.mjs';

const supabase = supabaseAdmin();
const preset = imagePresets['simpson-headshot'];
const batchSize = Number(process.env.HEADSHOT_BATCH_SIZE ?? 20);
const bucket = 'avatars';
const requestedNames = process.argv.slice(2).filter(Boolean);

if (!process.env.FAL_KEY) throw new Error('FAL_KEY must be set in frontend/.env.local.');
fal.config({ credentials: process.env.FAL_KEY });

function extension(contentType) {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'jpg';
}

function objectName(fullName, contentType) {
  return `${fullName.replace(/[\\/\0]/g, '-')}.${extension(contentType)}`;
}

async function falHostedSource(fullName, url) {
  const response = await fetch(url, { headers: { 'user-agent': 'CorporateTradersHeadshotPipeline/1.0' } });
  if (!response.ok) throw new Error(`Could not download source image (${response.status}).`);
  const contentType = response.headers.get('content-type')?.split(';')[0] ?? 'image/jpeg';
  if (!contentType.startsWith('image/')) throw new Error(`Source is not an image (${contentType}).`);
  return fal.storage.upload(new File(
    [new Uint8Array(await response.arrayBuffer())],
    objectName(fullName, contentType),
    { type: contentType },
  ));
}

async function update(fullName, values) {
  const { error } = await supabase
    .from('insiders')
    .update({ ...values, headshot_updated_at: new Date().toISOString() })
    .eq('full_name', fullName);
  if (error) throw error;
}

let insidersQuery = supabase
  .from('insiders')
  .select('full_name')
  .order('full_name');

if (requestedNames.length) {
  insidersQuery = insidersQuery.in('full_name', requestedNames);
} else {
  insidersQuery = insidersQuery.is('headshot_status', null).limit(batchSize);
}

const { data: insiders, error: readError } = await insidersQuery;
if (readError) throw readError;

for (const insider of insiders ?? []) {
  try {
    console.log(`[search] ${insider.full_name}`);
    const source = await findFirstGoogleImage(insider.full_name);
    if (!source) {
      await update(insider.full_name, {
        headshot_status: 'source_not_found',
        headshot_candidates: [],
        headshot_error: 'No Google Images result was found through SerpAPI.',
      });
      continue;
    }

    await update(insider.full_name, {
      headshot_status: 'source_needs_review',
      headshot_source_url: source.sourceUrl,
      headshot_source_title: source.title,
      headshot_source_attribution: source.source,
      headshot_source_license: null,
      headshot_source_license_url: source.sourcePageUrl,
      headshot_candidates: [source],
      headshot_error: null,
    });

    console.log(`[generate] ${insider.full_name}`);
    const sourceImageUrl = await falHostedSource(insider.full_name, source.sourceUrl);
    const result = await fal.subscribe(preset.model, {
      input: { prompt: preset.prompt, image_urls: [sourceImageUrl], image_size: preset.imageSize },
    });
    const image = result.data?.images?.[0];
    if (!image?.url) throw new Error('fal did not return a generated image URL.');

    const imageResponse = await fetch(image.url);
    if (!imageResponse.ok) throw new Error(`Could not download fal output (${imageResponse.status}).`);
    const contentType = imageResponse.headers.get('content-type')?.split(';')[0] ?? image.content_type ?? 'image/jpeg';
    const name = objectName(insider.full_name, contentType);
    const { error: uploadError } = await supabase.storage.from(bucket).upload(
      name,
      new Uint8Array(await imageResponse.arrayBuffer()),
      { contentType, upsert: true },
    );
    if (uploadError) throw uploadError;
    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(name);
    await update(insider.full_name, {
      avatar_url: publicUrl.publicUrl,
      headshot_generated_url: publicUrl.publicUrl,
      headshot_status: 'generated',
      headshot_error: null,
    });
    console.log(`[done] ${insider.full_name}`);
  } catch (error) {
    console.error(`[error] ${insider.full_name}: ${error.message}`);
    await update(insider.full_name, { headshot_status: 'error', headshot_error: error.message });
  }
}

console.log(`Processed ${insiders?.length ?? 0} new insider records.`);

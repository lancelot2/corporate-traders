import { fal } from '@fal-ai/client';
import { imagePresets } from './image-presets.mjs';
import { supabaseAdmin } from './supabase-client.mjs';

const supabase = supabaseAdmin();
const preset = imagePresets['simpson-headshot'];
const batchSize = Number(process.env.HEADSHOT_BATCH_SIZE ?? 5);
const sourceStatus = process.env.HEADSHOT_SOURCE_STATUS ?? 'source_approved';
const bucket = 'avatars';

if (!process.env.FAL_KEY) {
  throw new Error('FAL_KEY must be set in frontend/.env.local.');
}

fal.config({ credentials: process.env.FAL_KEY });

function fileExtension(contentType) {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'jpg';
}

function storageFileName(fullName, contentType) {
  // Keep the filename human-readable and equal to full_name, except path
  // separators (which would create unintended folders in Storage).
  const safeName = fullName.replace(/[\\/\0]/g, '-');
  return `${safeName}.${fileExtension(contentType)}`;
}

async function uploadSourceToFal(fullName, sourceUrl) {
  const response = await fetch(sourceUrl, {
    headers: { 'user-agent': 'CorporateTradersHeadshotPipeline/1.0' },
  });
  if (!response.ok) {
    throw new Error(`Could not download the source image (${response.status}).`);
  }

  const contentType = response.headers.get('content-type')?.split(';')[0] ?? 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    throw new Error(`The source URL did not return an image (received ${contentType}).`);
  }

  const sourceFile = new File(
    [new Uint8Array(await response.arrayBuffer())],
    storageFileName(fullName, contentType),
    { type: contentType },
  );
  return fal.storage.upload(sourceFile);
}

async function writeFailure(fullName, error) {
  const { error: updateError } = await supabase
    .from('insiders')
    .update({
      headshot_status: 'error',
      headshot_error: error.message,
      headshot_updated_at: new Date().toISOString(),
    })
    .eq('full_name', fullName);
  if (updateError) throw updateError;
}

const { data: insiders, error: readError } = await supabase
  .from('insiders')
  .select('full_name, headshot_source_url')
  .eq('headshot_status', sourceStatus)
  .not('headshot_source_url', 'is', null)
  .order('full_name')
  .limit(batchSize);

if (readError) throw readError;
if (!insiders?.length) {
  console.log(`No insiders with headshot_status = ${sourceStatus} need generation.`);
  process.exit(0);
}

for (const insider of insiders) {
  try {
    console.log(`Generating ${insider.full_name}…`);
    // SerpAPI sources can reject a request made from fal's servers. Downloading
    // first and handing fal a hosted copy makes the input consistently usable.
    const sourceImageUrl = await uploadSourceToFal(insider.full_name, insider.headshot_source_url);
    const result = await fal.subscribe(preset.model, {
      input: {
        prompt: preset.prompt,
        image_urls: [sourceImageUrl],
        image_size: preset.imageSize,
      },
    });
    const image = result.data?.images?.[0];
    if (!image?.url) throw new Error('fal did not return a generated image URL.');

    const imageResponse = await fetch(image.url);
    if (!imageResponse.ok) {
      throw new Error(`Could not download the fal output (${imageResponse.status}).`);
    }

    const contentType = imageResponse.headers.get('content-type')?.split(';')[0]
      ?? image.content_type
      ?? 'image/jpeg';
    const objectName = storageFileName(insider.full_name, contentType);
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(objectName, new Uint8Array(await imageResponse.arrayBuffer()), {
        contentType,
        upsert: true,
      });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(objectName);
    const publicUrl = publicUrlData.publicUrl;
    const { error: updateError } = await supabase
      .from('insiders')
      .update({
        avatar_url: publicUrl,
        headshot_generated_url: publicUrl,
        headshot_status: 'generated',
        headshot_error: null,
        headshot_updated_at: new Date().toISOString(),
      })
      .eq('full_name', insider.full_name);
    if (updateError) throw updateError;

    console.log(`Saved ${objectName} → ${publicUrl}`);
  } catch (error) {
    console.error(`Could not generate ${insider.full_name}: ${error.message}`);
    await writeFailure(insider.full_name, error);
  }
}

console.log(`Finished generating ${insiders.length} headshot${insiders.length === 1 ? '' : 's'}.`);

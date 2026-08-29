import { findFirstGoogleImage } from './serpapi-google-images.mjs';
import { supabaseAdmin } from './supabase-client.mjs';

const supabase = supabaseAdmin();
const batchSize = Number(process.env.HEADSHOT_BATCH_SIZE ?? 5);
const searchDelay = Number(process.env.HEADSHOT_SEARCH_DELAY_MS ?? 2_500);

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

const { data: insiders, error: readError } = await supabase
  .from('insiders')
  .select('cala_entity_id, full_name')
  .is('headshot_status', null)
  .order('full_name')
  .limit(batchSize);

if (readError) throw readError;
if (!insiders?.length) {
  console.log('No insiders need a source-headshot search.');
  process.exit(0);
}

for (const insider of insiders) {
  console.log(`Finding the first Google Images result for ${insider.full_name}…`);
  try {
    const recommended = await findFirstGoogleImage(insider.full_name);
    const update = recommended
      ? {
          headshot_status: 'source_needs_review',
          headshot_source_url: recommended.sourceUrl,
          headshot_source_title: recommended.title,
          headshot_source_attribution: recommended.source || null,
          headshot_source_license: null,
          headshot_source_license_url: recommended.sourcePageUrl,
          headshot_candidates: [recommended],
          headshot_error: null,
        }
      : {
          headshot_status: 'source_not_found',
          headshot_candidates: [],
          headshot_error: 'No Google Images result was found through SerpAPI.',
        };

    // Some legacy rows contain a non-UUID placeholder in cala_entity_id, so
    // full_name is the reliable identifier for this review-only workflow.
    const { error: updateError } = await supabase
      .from('insiders')
      .update({ ...update, headshot_updated_at: new Date().toISOString() })
      .eq('full_name', insider.full_name);
    if (updateError) throw updateError;
  } catch (error) {
    console.error(`Could not process ${insider.full_name}: ${error.message}`);
  }
  await delay(searchDelay);
}

console.log(`Finished source discovery for ${insiders.length} insider${insiders.length === 1 ? '' : 's'}.`);

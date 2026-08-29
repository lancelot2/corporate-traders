import { findHeadshotCandidates } from './wikimedia-commons.mjs';
import { supabaseAdmin } from './supabase-client.mjs';

const supabase = supabaseAdmin();
const batchSize = Number(process.env.HEADSHOT_BATCH_SIZE ?? 25);

const { data: insiders, error: readError } = await supabase
  .from('insiders')
  .select('cala_entity_id, full_name')
  .is('headshot_source_url', null)
  .order('full_name')
  .limit(batchSize);

if (readError) throw readError;
if (!insiders?.length) {
  console.log('No insiders need a source-headshot search.');
  process.exit(0);
}

for (const insider of insiders) {
  console.log(`Finding Wikimedia Commons candidates for ${insider.full_name}…`);
  try {
    const candidates = await findHeadshotCandidates(insider.full_name);
    const recommended = candidates[0];
    const update = recommended
      ? {
          headshot_status: 'source_needs_review',
          headshot_source_url: recommended.sourceUrl,
          headshot_source_title: recommended.title,
          headshot_source_attribution: recommended.credit || recommended.artist || null,
          headshot_source_license: recommended.license || null,
          headshot_source_license_url: recommended.licenseUrl,
          headshot_candidates: candidates.slice(0, 5),
          headshot_error: null,
        }
      : {
          headshot_status: 'source_not_found',
          headshot_candidates: [],
          headshot_error: 'No Wikimedia Commons image candidate was found.',
        };

    const { error: updateError } = await supabase
      .from('insiders')
      .update(update)
      .eq('cala_entity_id', insider.cala_entity_id);
    if (updateError) throw updateError;
  } catch (error) {
    console.error(`Could not process ${insider.full_name}: ${error.message}`);
  }
}

console.log(`Finished source discovery for ${insiders.length} insider${insiders.length === 1 ? '' : 's'}.`);

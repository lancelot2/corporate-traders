import { supabaseAdmin } from './supabase-client.mjs';

const supabase = supabaseAdmin();
const wikimediaFilter = 'headshot_source_url.ilike.%wikimedia.org%,headshot_error.ilike.%Wikimedia Commons%';

const { data: matches, error: readError } = await supabase
  .from('insiders')
  .select('full_name')
  .or(wikimediaFilter);

if (readError) throw readError;

const { error: resetError } = await supabase
  .from('insiders')
  .update({
    headshot_status: null,
    headshot_source_url: null,
    headshot_source_title: null,
    headshot_source_attribution: null,
    headshot_source_license: null,
    headshot_source_license_url: null,
    headshot_candidates: null,
    headshot_error: null,
    headshot_updated_at: new Date().toISOString(),
  })
  .or(wikimediaFilter);

if (resetError) throw resetError;
console.log(`Reset Wikimedia source data for ${matches?.length ?? 0} insider${matches?.length === 1 ? '' : 's'}.`);

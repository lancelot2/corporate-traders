alter table public.insiders
  add column if not exists headshot_status text,
  add column if not exists headshot_source_url text,
  add column if not exists headshot_source_title text,
  add column if not exists headshot_source_attribution text,
  add column if not exists headshot_source_license text,
  add column if not exists headshot_source_license_url text,
  add column if not exists headshot_candidates jsonb,
  add column if not exists headshot_generated_url text,
  add column if not exists headshot_error text,
  add column if not exists headshot_updated_at timestamptz;

alter table public.insiders
  drop constraint if exists insiders_headshot_status_check;

alter table public.insiders
  add constraint insiders_headshot_status_check
  check (headshot_status is null or headshot_status in (
    'source_needs_review',
    'source_not_found',
    'source_approved',
    'generated',
    'error'
  ));

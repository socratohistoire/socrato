begin;

create table if not exists socrato.student_analysis_failures (
  id uuid primary key,
  activity_id text not null references socrato.activities(id) on delete cascade,
  question_id text not null,
  attempt_number integer not null check (attempt_number between 1 and 2),
  failure_kind text not null check (failure_kind in ('timeout', 'rate_limit', 'http', 'network', 'invalid_response')),
  http_status integer,
  request_id text,
  duration_ms integer not null check (duration_ms >= 0),
  occurred_at timestamptz not null default now()
);

create index if not exists student_analysis_failures_activity_time_idx
  on socrato.student_analysis_failures(activity_id, occurred_at desc);

alter table socrato.student_analysis_failures enable row level security;
revoke all on socrato.student_analysis_failures from public, anon, authenticated;

insert into socrato.schema_migrations(version)
values ('20260904180000_student_analysis_failures')
on conflict (version) do nothing;

commit;

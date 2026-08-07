begin;

create table if not exists socrato.student_progress_submissions (
  id uuid primary key,
  session_id text not null references socrato.learning_sessions(id) on delete cascade,
  student_id text not null references socrato.students(id) on delete restrict,
  activity_id text not null references socrato.activities(id) on delete restrict,
  question_id text not null,
  expected_question_index integer not null check (expected_question_index >= 0),
  resulting_question_index integer not null check (resulting_question_index >= 0),
  accepted_at timestamptz not null default now()
);

create index if not exists student_progress_submissions_session_idx
  on socrato.student_progress_submissions(session_id, accepted_at);

alter table socrato.student_progress_submissions enable row level security;
revoke all on socrato.student_progress_submissions from public, anon, authenticated;

insert into socrato.schema_migrations(version)
values ('20260807163000_durable_student_progress_submissions')
on conflict (version) do nothing;

commit;

begin;

alter table socrato.student_progress
  add column if not exists question_runtime jsonb not null default '[]'::jsonb;

insert into socrato.schema_migrations(version)
values ('20260807170000_resumable_question_runtime')
on conflict (version) do nothing;

commit;

begin;

create schema if not exists socrato;
revoke all on schema socrato from public, anon, authenticated;

create table if not exists socrato.schema_migrations (
  version text primary key,
  applied_at timestamptz not null default now()
);

create table if not exists socrato.schools (
  id text primary key,
  display_name text not null check (length(trim(display_name)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists socrato.teachers (
  id text primary key,
  school_id text not null references socrato.schools(id) on delete restrict,
  identity_provider_subject text not null unique,
  display_name text not null check (length(trim(display_name)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists socrato.groups (
  id text primary key,
  school_id text not null references socrato.schools(id) on delete restrict,
  teacher_id text not null references socrato.teachers(id) on delete restrict,
  display_name text not null check (length(trim(display_name)) > 0),
  school_year text not null,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists socrato.students (
  id text primary key,
  school_id text not null references socrato.schools(id) on delete restrict,
  display_alias text not null check (length(trim(display_alias)) > 0),
  external_reference_digest text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  unique (school_id, external_reference_digest)
);

create table if not exists socrato.group_memberships (
  id text primary key,
  group_id text not null references socrato.groups(id) on delete restrict,
  student_id text not null references socrato.students(id) on delete restrict,
  active boolean not null default true,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  unique (group_id, student_id)
);

create table if not exists socrato.student_access_credentials (
  id text primary key,
  student_id text not null references socrato.students(id) on delete cascade,
  lookup_digest text not null unique,
  status text not null check (status in ('active', 'disabled')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists socrato.server_sessions (
  id text primary key,
  subject_type text not null check (subject_type in ('student', 'teacher')),
  subject_id text not null,
  token_digest text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists socrato.activities (
  id text primary key,
  schema_version integer not null check (schema_version > 0),
  teacher_id text not null references socrato.teachers(id) on delete restrict,
  title text not null check (length(trim(title)) > 0),
  work_type text not null check (work_type in ('revision', 'enrichment', 'development')),
  notion_ids text[] not null default '{}',
  operation_id text,
  question_ids text[] not null default '{}',
  publication_status text not null check (publication_status in ('published', 'suspended', 'archived')),
  published_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists socrato.activity_group_assignments (
  id text primary key,
  activity_id text not null references socrato.activities(id) on delete restrict,
  group_id text not null references socrato.groups(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  unique (activity_id, group_id)
);

create table if not exists socrato.teacher_drafts (
  teacher_id text primary key references socrato.teachers(id) on delete cascade,
  schema_version integer not null check (schema_version > 0),
  draft_id text not null,
  configuration jsonb not null,
  question_overrides jsonb not null default '{}'::jsonb,
  preview_question_index integer not null default 0 check (preview_question_index >= 0),
  updated_at timestamptz not null
);

create table if not exists socrato.learning_sessions (
  id text primary key,
  activity_id text not null references socrato.activities(id) on delete restrict,
  student_id text not null references socrato.students(id) on delete restrict,
  group_id text not null references socrato.groups(id) on delete restrict,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists socrato.student_progress (
  session_id text primary key references socrato.learning_sessions(id) on delete cascade,
  schema_version integer not null check (schema_version > 0),
  activity_id text not null references socrato.activities(id) on delete restrict,
  student_id text not null references socrato.students(id) on delete restrict,
  group_id text not null references socrato.groups(id) on delete restrict,
  notion_id text not null,
  state text not null check (state in ('not_started', 'in_progress', 'completed')),
  current_question_index integer not null check (current_question_index >= 0),
  total_questions integer not null check (total_questions > 0),
  completed_question_ids text[] not null default '{}',
  operation_results jsonb not null default '[]'::jsonb,
  historical_knowledge_results jsonb not null default '[]'::jsonb,
  started_at timestamptz not null,
  updated_at timestamptz not null,
  completed_at timestamptz
);

create table if not exists socrato.student_responses (
  id text primary key,
  session_id text not null references socrato.learning_sessions(id) on delete cascade,
  student_id text not null references socrato.students(id) on delete restrict,
  activity_id text not null references socrato.activities(id) on delete restrict,
  question_id text not null,
  notion_id text not null,
  primary_operation_id text not null,
  operation_ids text[] not null default '{}',
  historical_knowledge_ids text[] not null default '{}',
  document_ids text[] not null default '{}',
  attempt_number integer not null check (attempt_number between 1 and 3),
  hint_level integer not null check (hint_level between 0 and 2),
  content_ciphertext text not null,
  submitted_at timestamptz not null default now(),
  retention_expires_at timestamptz not null
);

create table if not exists socrato.student_outcomes (
  session_id text primary key references socrato.learning_sessions(id) on delete cascade,
  student_id text not null references socrato.students(id) on delete restrict,
  activity_id text not null references socrato.activities(id) on delete restrict,
  summary jsonb not null,
  completed_at timestamptz not null
);

create index if not exists groups_teacher_id_idx on socrato.groups(teacher_id);
create index if not exists group_memberships_student_id_idx on socrato.group_memberships(student_id);
create index if not exists activities_teacher_id_idx on socrato.activities(teacher_id);
create index if not exists activities_publication_status_idx on socrato.activities(publication_status);
create index if not exists activity_assignments_group_id_idx on socrato.activity_group_assignments(group_id);
create index if not exists learning_sessions_student_activity_idx on socrato.learning_sessions(student_id, activity_id);
create index if not exists student_responses_session_id_idx on socrato.student_responses(session_id);
create index if not exists student_responses_retention_idx on socrato.student_responses(retention_expires_at);

alter table socrato.schema_migrations enable row level security;
alter table socrato.schools enable row level security;
alter table socrato.teachers enable row level security;
alter table socrato.groups enable row level security;
alter table socrato.students enable row level security;
alter table socrato.group_memberships enable row level security;
alter table socrato.student_access_credentials enable row level security;
alter table socrato.server_sessions enable row level security;
alter table socrato.activities enable row level security;
alter table socrato.activity_group_assignments enable row level security;
alter table socrato.teacher_drafts enable row level security;
alter table socrato.learning_sessions enable row level security;
alter table socrato.student_progress enable row level security;
alter table socrato.student_responses enable row level security;
alter table socrato.student_outcomes enable row level security;

revoke all on all tables in schema socrato from public, anon, authenticated;
revoke all on all sequences in schema socrato from public, anon, authenticated;

insert into socrato.schema_migrations(version)
values ('20260806093000_initial_socrato_schema')
on conflict (version) do nothing;

commit;

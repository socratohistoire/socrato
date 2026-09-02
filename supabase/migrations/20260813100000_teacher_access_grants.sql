create table if not exists socrato.teacher_access_grants (
  email text primary key,
  role text not null default 'teacher' check (role in ('teacher', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table socrato.teacher_access_grants enable row level security;

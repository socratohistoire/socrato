alter table socrato.student_access_credentials
  add column if not exists encrypted_code text;

comment on column socrato.student_access_credentials.encrypted_code is
  'Copie chiffrée côté application du code, récupérable uniquement par l’enseignant propriétaire.';

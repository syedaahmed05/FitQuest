-- Up Migration
ALTER TABLE users
  ADD COLUMN role text NOT NULL DEFAULT 'student',
  ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'admin'));
ALTER TABLE users DROP COLUMN display_name;

-- Down Migration
ALTER TABLE users ADD COLUMN display_name text;
ALTER TABLE users DROP COLUMN role;
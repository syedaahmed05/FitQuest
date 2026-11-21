-- Up Migration
CREATE TABLE admins (
  user_id     uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  admin_level text NOT NULL DEFAULT 'standard'
);

-- Down Migration
DROP TABLE admins;
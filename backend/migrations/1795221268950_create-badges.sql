-- Up Migration
CREATE TABLE badges (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        text NOT NULL UNIQUE,
  description text
);

-- Down Migration
DROP TABLE badges;
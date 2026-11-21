-- Up Migration
CREATE TABLE workout_types (
  id       integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name     text NOT NULL UNIQUE,
  category text NOT NULL
);

-- Down Migration
DROP TABLE workout_types;
-- Up Migration
CREATE TABLE workouts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  workout_type_id integer NOT NULL REFERENCES workout_types(id),
  duration_min    integer NOT NULL CHECK (duration_min > 0),
  distance_mi     numeric(6,2) CHECK (distance_mi >= 0),
  source          text NOT NULL DEFAULT 'manual',
  logged_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX workouts_student_id_logged_at_idx ON workouts (student_id, logged_at);

-- Down Migration
DROP TABLE workouts;
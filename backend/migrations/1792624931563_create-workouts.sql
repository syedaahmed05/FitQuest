-- Up Migration
CREATE TABLE workouts (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            text NOT NULL,
    duration_min    integer NOT NULL CHECK (duration_min > 0),
    logged_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX workouts_user_id_logged_at_idx ON workouts (user_id, logged_at);

-- Down Migration
DROP TABLE workouts;
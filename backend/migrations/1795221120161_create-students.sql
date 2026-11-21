-- Up Migration
CREATE TABLE students (
  user_id        uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name   text,
  height_in      integer CHECK (height_in > 0),
  goal_weight_lb numeric(5,1) CHECK (goal_weight_lb > 0),
  fitness_goals  text
);

-- Down Migration
DROP TABLE students;
const { Pool } = require('pg');

// DATABASE_URL comes from your .env file (loaded by dotenv-cli in the npm script).
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const workoutTypes = [
  ['Walk', 'cardio'],
  ['Run', 'cardio'],
  ['Ride', 'cardio'],
  ['Swim', 'cardio'],
  ['Workout', 'strength'],
  ['Stretch', 'flexibility'],
];

const badges = [
  ['First Workout', 'Logged your first workout'],
  ['7-Day Streak', 'Worked out 7 days in a row'],
  ['Challenge Finisher', 'Completed a challenge'],
  ['100 Minute Club', 'Logged 100 minutes in one week'],
];

const students = [
  { username: 'sam',    name: 'Sam Rivera',    heightIn: 68, goalLb: 165 },
  { username: 'alex',   name: 'Alex Lewis',    heightIn: 71, goalLb: 180 },
  { username: 'jordan', name: 'Jordan Smith',  heightIn: 66, goalLb: 150 },
  { username: 'taylor', name: 'Taylor Brooks', heightIn: 64, goalLb: 135 },
  { username: 'morgan', name: 'Morgan Lee',    heightIn: 70, goalLb: 175 },
  { username: 'casey',  name: 'Casey Nguyen',  heightIn: 62, goalLb: 128 },
  { username: 'riley',  name: 'Riley Patel',   heightIn: 69, goalLb: 170 },
  { username: 'jamie',  name: 'Jamie Chen',    heightIn: 65, goalLb: 140 },
  { username: 'avery',  name: 'Avery Johnson', heightIn: 72, goalLb: 190 },
  { username: 'quinn',  name: 'Quinn Davis',   heightIn: 67, goalLb: 155 },
];

async function seed() {
  const client = await pool.connect();
  try {
    // A transaction: either everything succeeds, or nothing changes.
    await client.query('BEGIN');

    // Wipe old data so the script can be run again and again.
    await client.query(
      'TRUNCATE workouts, students, admins, workout_types, badges, users RESTART IDENTITY CASCADE'
    );

    // Lookup tables
    for (const [name, category] of workoutTypes) {
      await client.query(
        'INSERT INTO workout_types (name, category) VALUES ($1, $2)',
        [name, category]
      );
    }
    for (const [name, description] of badges) {
      await client.query(
        'INSERT INTO badges (name, description) VALUES ($1, $2)',
        [name, description]
      );
    }

    // One admin: a users row plus an admins row
    const admin = await client.query(
      `INSERT INTO users (email, username, password_hash, role)
       VALUES ($1, $2, $3, 'admin') RETURNING id`,
      ['admin@example.com', 'admin', 'fakehash']
    );
    await client.query('INSERT INTO admins (user_id) VALUES ($1)', [admin.rows[0].id]);

    // Ten students: a users row plus a students row each
    for (const s of students) {
      const user = await client.query(
        `INSERT INTO users (email, username, password_hash, role)
         VALUES ($1, $2, $3, 'student') RETURNING id`,
        [`${s.username}@example.com`, s.username, 'fakehash']
      );
      await client.query(
        `INSERT INTO students (user_id, display_name, height_in, goal_weight_lb)
         VALUES ($1, $2, $3, $4)`,
        [user.rows[0].id, s.name, s.heightIn, s.goalLb]
      );
    }

    // 30 random workouts per student, spread over the last 30 days
    await client.query(`
      WITH t AS (
        SELECT array_agg(id ORDER BY id) AS ids FROM workout_types
      ),
      raw AS MATERIALIZED (
        SELECT s.user_id AS student_id,
               t.ids[1 + floor(random() * array_length(t.ids, 1))::int] AS workout_type_id,
               10 + floor(random() * 80)::int AS duration_min,
               now() - random() * interval '30 days' AS logged_at
        FROM students s, generate_series(1, 30), t
      )
      INSERT INTO workouts (student_id, workout_type_id, duration_min, distance_mi, logged_at)
      SELECT student_id,
             workout_type_id,
             duration_min,
             round((duration_min * (0.04 + random() * 0.06))::numeric, 2),
             logged_at
      FROM raw
    `);

    await client.query('COMMIT');
    console.log('Seeded 1 admin, 10 students, 6 workout types, 4 badges, and 300 workouts.');
  } catch (err) {
    await client.query('ROLLBACK'); // undo everything if something failed
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end(); // close connections so the script can exit
  }
}

seed();
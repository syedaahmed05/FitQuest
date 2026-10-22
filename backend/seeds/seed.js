const { Pool } = require('pg');

//A pool is a set of reusable database connections.
//DATABASE_URL comes from your .env file.
const pool = new Pool({connectionString: process.env.DATABASE_URL});

const names = [
    'sam', 'alex', 'jordan', 'taylor', 'morgan',
    'casey', 'riley', 'lexi', 'Zendeya', 'quinn',
];

async function seed() {
    const client = await pool.connect();
    try {
        //A transaction: either everything below succeeds, or nothing changes.
        await client.query('BEGIN');
        //Wipe old data so the script can be run again and again.
        await client.query('TRUNCATE workouts, users CASCADE');

        //Insert 10 users. $1, $2... are placeholders filled from the array.
        for (const name of names) {
            await client.query(
                `INSERT INTO users (email, username, password_hash, display_name)
                VALUES ($1, $2, $3, $4)`,
            [
                `${name}@example.com`,
                name,
                'fakehash', //placeholder until we build real auth
                name.charAt(0).toUpperCase() + name.slice(1),
            ]
                
            );
        }

        //Give every user 30 random workouts from the last 30 days.
        //creates 300 rows: FROM users u, generate_series(1, 30) pairs every user with the numbers 1 to 30, 
        // so each user gets 30 rows. The random() pieces pick a workout type, a duration of 10-89 minutes, 
        // and a date within the last 30 days.
        await client.query(`
            INSERT INTO workouts (user_id, type, duration_min, logged_at)
            SELECT 
            u.id,
            (ARRAY['run', 'ride', 'swim', 'lift'])[1 + floor(random() * 4)::int],
            10 + floor(random() * 80)::int,
            now() - random() * interval '30 days'
            FROM users u, generate_series(1,30)
            `);

        await client.query('COMMIT');
        console.log('Seeded 10 users and 300 workouts.');

    } catch (err) {
        await client.query('ROLLBACK'); //undo everything if something failed
        console.error('Seeding failed:', err);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end(); //close connections so the script can exit
    }
}

seed();

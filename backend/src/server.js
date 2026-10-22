const path = require('path');
const express = require('express');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the frontend files from the docs/ folder at http://localhost:3000
app.use(express.static(path.join(__dirname, '../../docs')));

// The leaderboard endpoint
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.username, SUM(w.duration_min)::int AS total_minutes
      FROM users u
      JOIN workouts w ON w.user_id = u.id
      WHERE w.logged_at >= now() - interval '7 days'
      GROUP BY u.id, u.username
      ORDER BY total_minutes DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
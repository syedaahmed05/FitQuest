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
      SELECT u.username, s.display_name,
             SUM(w.duration_min)::int AS total_minutes,
             COUNT(w.id)::int AS workouts
      FROM workouts w
      JOIN students s ON s.user_id = w.student_id
      JOIN users u ON u.id = s.user_id
      WHERE w.logged_at >= now() - interval '7 days'
      GROUP BY u.id, u.username, s.display_name
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
# FitQuest

A gamified fitness tracking website where users log workouts, join challenges, and compete on leaderboards.

## Tech stack

- Frontend: HTML, CSS, JavaScript (in `docs/`)
- Backend: Node.js
- Database: PostgreSQL (Docker locally, AWS RDS in production)
- Migrations: node-pg-migrate

## Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (LTS version)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- A Postgres client such as [DBeaver](https://dbeaver.io/) (optional but recommended)

## Local setup

1. Clone the repo and open the `FitQuest` folder.
2. Copy the example environment file:
```
   cp .env.example .env
```
   (On Windows PowerShell: `Copy-Item .env.example .env`)
3. Start the local database (make sure Docker Desktop is running):
```
   docker compose up -d
```
4. Install backend dependencies and set up the database tables:
```
   cd backend
   npm install
   npm run migrate
```

## Database workflow

The database structure is defined by migration files in `backend/migrations/`, not by editing tables by hand.

| Command | What it does |
|---|---|
| `npm run migrate` | Applies any new migrations |
| `npm run migrate:down` | Undoes the most recent migration |
| `npm run migrate:create -- name` | Creates a new empty migration file |

Rules:
- Never edit a migration after it has been merged to `main`. Create a new one instead.
- After every `git pull`, run `npm run migrate`.
- Never commit `.env`. If you add a new variable, add it to `.env.example` with a placeholder value.

To reset your local database from scratch:
```
docker compose down -v
docker compose up -d
cd backend && npm run migrate
```

## Project structure

```
FitQuest/
  docs/          # frontend
  backend/
    migrations/  # schema changes
    seeds/       # fake-data scripts
  .env.example
  docker-compose.yaml
```
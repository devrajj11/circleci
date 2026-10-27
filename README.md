# Status Board

A small full-stack app: React (Vite) frontend + Node/Express backend.
Track services and set each one to operational, degraded, or down.

## Run it

Terminal 1 (API on :4000):

    cd server
    npm install
    npm start

Terminal 2 (UI on :5173):

    cd client
    npm install
    npm run dev

Open http://localhost:5173. Vite proxies `/api` to the Node server, so there is no CORS setup.

## API

| Method | Path                | Body                  |
|--------|---------------------|-----------------------|
| GET    | /api/services       |                       |
| POST   | /api/services       | { name }              |
| PATCH  | /api/services/:id   | { status }            |
| DELETE | /api/services/:id   |                       |

Data lives in memory and resets when the server restarts. Swap the `services` array in
`server/index.js` for a database (DynamoDB, Postgres) as a next step.

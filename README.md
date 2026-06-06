# Lab2 — Job & Freelance Marketplace

Një platformë që lidh kërkuesit e punës dhe freelancer-at me klientët për bashkëpunim të lehtë.

A job & freelance marketplace (think *LinkedIn + Upwork*) with four roles — **job seekers**,
**freelancers**, **recruiters**, and **admins**. It is built on a **CQRS architecture**: MySQL is
the transactional source of truth (write side) and MongoDB serves denormalised read models.



---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, React Router v6, Tailwind CSS, axios, socket.io-client |
| Backend | Node.js + Express 5, Socket.IO |
| Write DB | MySQL + Sequelize ORM |
| Read DB | MongoDB + Mongoose |
| Auth | JWT (access) + httpOnly refresh cookie + bcrypt |
| Payments | Stripe (Checkout + webhooks) |

---

## Prerequisites

Install these before you start:

- **Node.js** ≥ 18 and npm
- **MySQL** ≥ 8 running locally
- **MongoDB** ≥ 6 running locally
- **Stripe account** (test mode) — the backend requires a `STRIPE_SECRET_KEY` to boot
- *(optional)* **Stripe CLI** — to forward webhooks during local payment testing

---

## Project structure

```
Lab2/
├── backend/      # Express API, Sequelize (MySQL), Mongoose (MongoDB), Socket.IO
│   └── src/      # routes, controllers, application (CQRS), repositories, models, sync, socket
├── frontend/     # React + Vite app
│   └── src/      # pages, components, context, services, hooks
└── STUDY_GUIDE.md
```

---

## Setup

### 1. Clone and install dependencies

```bash
git clone https://github.com/loramulaku/Lab2.git
cd Lab2

# Install both apps
cd backend  && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Create the databases

```bash
# In a MySQL shell:
CREATE DATABASE jobportal_db;
```

MongoDB needs no manual setup — the `jobportal_read` database is created on first connection.

### 3. Configure backend environment

Copy the example env file and fill in your values:

```bash
cd backend
cp .env.example .env
```

`.env` keys:

| Variable | Description |
|---|---|
| `MYSQL_HOST` / `MYSQL_PORT` / `MYSQL_DB` / `MYSQL_USER` / `MYSQL_PASS` | MySQL connection |
| `MONGO_URI` | MongoDB connection string (e.g. `mongodb://localhost:27017/jobportal_read`) |
| `JWT_SECRET` | Secret used to sign access tokens — **use a long random value** |
| `PORT` | Backend port (default `3001`) |
| `NODE_ENV` | `development` or `production` |
| `STRIPE_SECRET_KEY` | Stripe test secret key — **required for the server to boot** |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (from `stripe listen`) |
| `FRONTEND_URL` | Frontend origin for redirects/CORS (default `http://localhost:5173`) |

> The frontend needs no `.env` — in dev, Vite proxies `/api` and `/uploads` to the backend.

### 4. Run migrations and seed initial data

```bash
cd backend
npm run setup    # runs migrations, seeds roles, and creates the default admin user
```

This creates a default admin account:

```
Email:    admin@hireflow.com
Password: admin123
```

> **Change this password before any non-local deployment.**

---

## Running the app (development)

Open two terminals.

**Terminal 1 — backend** (http://localhost:3001):

```bash
cd backend
npm run dev      # nodemon with auto-reload  (or: npm start)
```

**Terminal 2 — frontend** (http://localhost:5173):

```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Stripe webhooks (optional, for payment testing)

In a third terminal, forward Stripe events to the local webhook endpoint:

```bash
cd backend
npm run stripe:webhook   # stripe listen --forward-to localhost:3001/api/subscriptions/webhook
```

Copy the `whsec_...` value it prints into `STRIPE_WEBHOOK_SECRET` in your `.env`.

---

## Testing

```bash
cd backend
npm test                 # full Jest suite
npm run test:handlers    # CQRS handler tests only
npm run test:sync        # MySQL→MongoDB projection tests only
```

---

## Building for production

```bash
cd frontend
npm run build            # outputs to frontend/dist/ (code-split, lazy-loaded chunks)
npm run preview          # preview the production build locally
```

---

## Useful backend scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start API with auto-reload (nodemon) |
| `npm start` | Start API |
| `npm run setup` | Migrate + seed roles + seed admin user |
| `npm run db:migrate` | Run Sequelize migrations |
| `npm run db:migrate:undo` | Roll back the last migration |
| `npm run seed:roles` | Seed the role rows |
| `npm run seed:admin-user` | Create/ensure the default admin |
| `npm run sync:retry` | Retry failed MySQL→MongoDB syncs (`FailedSyncs`) |
| `npm test` | Run the Jest test suite |

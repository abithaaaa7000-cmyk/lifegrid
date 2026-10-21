# LIFEGRID Backend

Node.js + Express + MongoDB API for the LIFEGRID household resilience
platform. This is the "Database" module in the project architecture:

```
React
 ↓
Axios / Fetch
 ↓
Node.js + Express
 ↓
MongoDB
```

## Structure

```
backend/
├── server.js              Express app entry point
├── config/
│   └── db.js               Mongoose connection
├── models/
│   ├── Family.js            Household schema (matches frontend mockData.js)
│   └── User.js              Field worker / admin accounts
├── controllers/
│   ├── authController.js
│   └── familyController.js
├── routes/
│   ├── authRoutes.js
│   └── familyRoutes.js
├── middleware/
│   └── auth.js               JWT verification + role guard
├── utils/
│   └── scoringEngine.js      Vulnerability scoring (mirrors the frontend's
│                              placeholder engine, until the real Python
│                              engine is wired in)
└── scripts/
    └── seed.js                Demo users + sample households
```

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGODB_URI / JWT_SECRET
npm run seed            # optional: loads demo users + sample households
npm run dev              # starts the API with nodemon on $PORT (default 5000)
```

Requires a running MongoDB instance — either local (`mongodb://127.0.0.1:27017/lifegrid`)
or a free MongoDB Atlas cluster.

### Demo logins (after `npm run seed`)

| Role         | Email                          | Password    |
|--------------|---------------------------------|-------------|
| Field Worker | priya.fieldworker@lifegrid.dev | password123 |
| Admin        | kumar.admin@lifegrid.dev       | password123 |

## API

All endpoints are prefixed with `/api`. Protected routes expect
`Authorization: Bearer <token>`.

### Auth

| Method | Route             | Access  | Description                          |
|--------|-------------------|---------|---------------------------------------|
| POST   | `/auth/register`  | Public  | Create a field-worker or admin account |
| POST   | `/auth/login`      | Public  | Returns `{ token, user }`             |
| GET    | `/auth/me`         | Any     | Returns the signed-in user            |

### Families

| Method | Route                | Access        | Description                                             |
|--------|----------------------|---------------|-----------------------------------------------------------|
| GET    | `/families`           | Any           | List households. `?assessmentStatus=pending\|completed`   |
| GET    | `/families/stats`     | Any           | Dashboard counts + risk-tier funnel                       |
| GET    | `/families/:id`        | Any           | Fetch one household (`:id` = familyCode like `F-1001` or Mongo `_id`) |
| POST   | `/families`             | Any           | Register a household (Module 4)                          |
| PUT    | `/families/:id`          | Any           | Update a household / mark assessment complete             |
| DELETE | `/families/:id`           | Admin only    | Remove a household                                        |

Creating or updating a household automatically recomputes its
`vulnerability.score` and `vulnerability.tierLabel` via
`utils/scoringEngine.js`.

## Connecting the frontend

`lifegrid-frontend/src/data/mockData.js` and `src/context/AppContext.jsx`
are written so this swap is mechanical: every function that currently
returns mock data (`sampleFamilies`, `addFamily`, `login`) should become a
`fetch`/`axios` call to the routes above, storing the returned JWT and
reading `family.id` / `family.vulnerability.score` exactly as the mock
functions do today. No component code should need to change.

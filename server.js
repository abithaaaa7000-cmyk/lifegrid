require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const familyRoutes = require('./routes/familyRoutes')
const cascadeRoutes = require('./routes/cascadeRoutes')
const interventionRoutes = require('./routes/interventionRoutes')

// React -> Axios/Fetch -> Node.js + Express -> MongoDB
// This file is the "Node.js + Express" hop: it exposes the REST API the
// frontend will call once its mock data layer (src/data/mockData.js) is
// swapped for real requests.
const app = express()

app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim()),
    credentials: true,
  }),
)
app.use(express.json())
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'lifegrid-backend' })
})

app.use('/api/auth', authRoutes)
app.use('/api/families', familyRoutes)
app.use('/api/cascade', cascadeRoutes) // Module 8 — Shock Simulation & Cascade
app.use('/api/interventions', interventionRoutes) // Module 9 — Intervention Optimization

// 404 fallback for unknown API routes.
app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'Not found.' })
})

// Centralized error handler — anything thrown/rejected and not already
// caught in a controller lands here instead of crashing the process.
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong.' })
})

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✔ LIFEGRID API listening on http://localhost:${PORT}`)
  })
})

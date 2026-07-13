import './loadEnv.js'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { initDb } from './db.js'
import authRoutes from './routes/auth.js'
import surveyRoutes from './routes/surveys.js'
import publicRoutes from './routes/public.js'

const PORT = process.env.PORT || 3001
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

await initDb()

const app = express()

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api/surveys', surveyRoutes)
app.use('/api/public', publicRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: '服务器错误' })
})

app.listen(PORT, () => {
  console.log(`API server http://localhost:${PORT}`)
})

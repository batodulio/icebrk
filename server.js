// ============================================================================
// IceBrk — Azure App Service host
//
// One Node process does three jobs:
//   1. serves the built Vite bundle in dist/
//   2. exposes /api/settings/:gameId, the two calls useCloudSync needs
//   3. answers every other GET with index.html so react-router deep links work
//
// Identity comes from App Service Easy Auth, which injects the signed-in user
// as request headers AFTER stripping any copies the client tried to send. The
// database connection uses the app's managed identity, so this file contains
// no credentials of any kind.
// ============================================================================

import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sql from 'mssql'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(__dirname, 'dist')

const app = express()

// App Service terminates TLS at its front end and forwards over HTTP, so trust
// exactly one proxy hop for correct req.ip and req.protocol values.
app.set('trust proxy', 1)
// Stop advertising the framework and version to anyone probing for known CVEs.
app.disable('x-powered-by')

// ---------------------------------------------------------------------------
// Security headers, applied to everything this process serves.
// (The /.auth/* routes never reach here — the platform handles those.)
// ---------------------------------------------------------------------------
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  // Google Fonts ships a stylesheet, and the app sets a few inline styles.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

app.use((_req, res, next) => {
  res.setHeader('Content-Security-Policy', CSP)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  next()
})

// ---------------------------------------------------------------------------
// Who is calling?
//
// Easy Auth removes any inbound X-MS-CLIENT-PRINCIPAL-* headers from client
// requests and re-injects them only for a valid session, so a browser cannot
// forge one. The principal id is a stable object identifier — unlike the email
// in /.auth/me, it survives the user renaming their account.
// ---------------------------------------------------------------------------
function callerId(req) {
  const id = req.get('x-ms-client-principal-id')
  return id && id.length <= 128 ? id : null
}

// ---------------------------------------------------------------------------
// Rate limiting. F1 gives 60 CPU-minutes a day and the SQL free offer gives
// 100,000 vCore-seconds a month — a hot loop from one client could burn either.
// In-memory is sufficient because Free and Shared tiers run a single instance;
// revisit if you ever scale out.
// ---------------------------------------------------------------------------
const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 120
const hits = new Map()

function rateLimit(req, res, next) {
  const key = callerId(req) ?? req.ip
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return next()
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000))
    return res.status(429).json({ error: 'Too many requests' })
  }
  entry.count += 1
  return next()
}

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of hits) {
    if (now > entry.resetAt) hits.delete(key)
  }
}, WINDOW_MS).unref()

// ---------------------------------------------------------------------------
// Database. `azure-active-directory-default` uses the app's managed identity
// when running on App Service, and your `az login` session when running on your
// Mac — the same code path works in both places with no credentials stored.
// ---------------------------------------------------------------------------
let poolPromise = null

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool({
      server: process.env.SQL_SERVER,
      database: process.env.SQL_DATABASE,
      authentication: { type: 'azure-active-directory-default' },
      options: { encrypt: true, trustServerCertificate: false },
      pool: { max: 4, min: 0, idleTimeoutMillis: 30_000 },
    })
      .connect()
      .catch((error) => {
        // Clear the cached promise so the next request retries instead of
        // permanently reusing a rejected connection.
        poolPromise = null
        throw error
      })
  }
  return poolPromise
}

// The six games that own a settings row. Anything else is rejected before it
// reaches the database, so game_id can never carry an unexpected value.
const GAMES = new Set([
  'roulette',
  'would-you-rather',
  'jeopardy',
  'bingo',
  'two-truths-and-a-lie',
  'scavenger-hunt',
])

const MAX_PAYLOAD_BYTES = 64 * 1024

// ---------------------------------------------------------------------------
// API
//
// Every statement is parameterised — no user input is ever concatenated into
// SQL. Each batch sets the session context and does its work together, so both
// run on the same pooled connection and the Row Level Security predicate sees
// the right identity. The WHERE / MERGE conditions also filter on @uid, making
// RLS a second line of defence rather than the only one.
// ---------------------------------------------------------------------------
app.get('/api/settings/:gameId', rateLimit, async (req, res) => {
  const userId = callerId(req)
  if (!userId) return res.sendStatus(401)
  if (!GAMES.has(req.params.gameId)) return res.sendStatus(404)

  try {
    const pool = await getPool()
    const result = await pool
      .request()
      .input('uid', sql.NVarChar(128), userId)
      .input('gid', sql.VarChar(32), req.params.gameId)
      .query(`
        EXEC sp_set_session_context @key = N'user_id', @value = @uid;
        SELECT payload FROM dbo.game_settings
         WHERE user_id = @uid AND game_id = @gid;
      `)

    const row = result.recordset?.[0]
    if (!row) return res.sendStatus(204)

    // payload is already JSON text in the column; skip a parse/stringify pass.
    res.setHeader('Cache-Control', 'no-store')
    return res.type('application/json').send(row.payload)
  } catch (error) {
    console.error('GET /api/settings failed:', error.message)
    return res.sendStatus(503)
  }
})

app.put('/api/settings/:gameId', rateLimit, express.json({ limit: '64kb' }), async (req, res) => {
  const userId = callerId(req)
  if (!userId) return res.sendStatus(401)
  if (!GAMES.has(req.params.gameId)) return res.sendStatus(404)

  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Expected a JSON object' })
  }

  // The row is keyed on the caller's own id. Anything the client claims about
  // identity is discarded here rather than trusted.
  const payload = JSON.stringify(req.body)
  if (Buffer.byteLength(payload, 'utf8') > MAX_PAYLOAD_BYTES) return res.sendStatus(413)

  try {
    const pool = await getPool()
    await pool
      .request()
      .input('uid', sql.NVarChar(128), userId)
      .input('gid', sql.VarChar(32), req.params.gameId)
      .input('payload', sql.NVarChar(sql.MAX), payload)
      .query(`
        EXEC sp_set_session_context @key = N'user_id', @value = @uid;
        MERGE dbo.game_settings WITH (HOLDLOCK) AS target
        USING (SELECT @uid AS user_id, @gid AS game_id) AS source
           ON target.user_id = source.user_id AND target.game_id = source.game_id
        WHEN MATCHED THEN
          UPDATE SET payload = @payload, updated_at = sysutcdatetime()
        WHEN NOT MATCHED THEN
          INSERT (user_id, game_id, payload) VALUES (@uid, @gid, @payload);
      `)

    return res.sendStatus(204)
  } catch (error) {
    console.error('PUT /api/settings failed:', error.message)
    return res.sendStatus(503)
  }
})

// Liveness check that deliberately avoids touching the database, so it stays
// cheap and keeps the serverless database free to auto-pause.
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }))

// ---------------------------------------------------------------------------
// Static assets and the SPA shell
// ---------------------------------------------------------------------------

// Vite emits content-hashed filenames, so a long cache lifetime is safe here.
// index:false leaves "/" to the fallback below.
app.use(
  express.static(dist, {
    maxAge: '1y',
    index: false,
    dotfiles: 'ignore',
    redirect: false,
  }),
)

// An unmatched /api path is a 404, never the HTML shell — otherwise a typo'd
// endpoint returns 200 with a page, and the client parses it as data.
// Tested explicitly rather than via a route pattern, because Express 4 and 5
// disagree about how regular-expression mount paths match.
app.use((req, res, next) => {
  if (req.path === '/api' || req.path.startsWith('/api/')) return res.sendStatus(404)
  return next()
})

// Everything else is a client-side route: /jeopardy, /support, /login, …
app.get(/.*/, (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache')
  res.sendFile(path.join(dist, 'index.html'))
})

// Last-resort handler: log the detail, tell the client nothing useful.
app.use((error, _req, res, _next) => {
  console.error('Unhandled error:', error.message)
  res.sendStatus(500)
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`IceBrk listening on ${port}`)
})

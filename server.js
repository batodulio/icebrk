// ============================================================================
// IceBrk — Azure App Service host
//
// One Node process does four jobs:
//   1. serves the built Vite bundle in dist/
//   2. exposes /api/auth/*, username + password sign-up and sign-in
//   3. exposes /api/settings/:gameId, the two calls useCloudSync needs, and
//      /api/images, the pictures hosts attach to Jeopardy clues
//   4. answers every other GET with index.html so react-router deep links work
//
// Identity is a signed session cookie this process issues itself after
// checking a scrypt password hash in dbo.users. The only secret involved is
// SESSION_SECRET, read from the App Service settings. The database connection
// uses the app's managed identity, so this file contains no credentials.
// ============================================================================

import express from 'express'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
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
// Sessions
//
// The cookie holds { sub, name, exp } plus an HMAC-SHA256 over it, keyed by
// SESSION_SECRET. A browser can read its own cookie's payload in principle, but
// cannot alter it without breaking the signature, so the user id in it can be
// trusted. Being stateless, checking it costs no database round trip, which
// keeps the serverless database asleep while a signed-in host browses.
//
// Sign-out clears the cookie. A copied cookie stays valid until it expires,
// which is the trade for keeping session checks off the database.
// ---------------------------------------------------------------------------
const SESSION_COOKIE = 'icebrk_session'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000
const SESSION_SECRET = process.env.SESSION_SECRET ?? ''
const sessionsEnabled = SESSION_SECRET.length >= 32

if (!sessionsEnabled) {
  console.warn('SESSION_SECRET is missing or shorter than 32 characters; sign-in stays off until it is set.')
}

function sign(data) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url')
}

function cookieOptions(req) {
  // req.secure is true behind App Service (trust proxy + X-Forwarded-Proto),
  // and false on http://localhost, where a Secure cookie would be dropped.
  return { httpOnly: true, secure: req.secure, sameSite: 'lax', path: '/' }
}

function issueSession(req, res, user) {
  const payload = Buffer.from(
    JSON.stringify({ sub: user.id, name: user.name, exp: Date.now() + SESSION_TTL_MS }),
  ).toString('base64url')
  res.cookie(SESSION_COOKIE, `${payload}.${sign(payload)}`, { ...cookieOptions(req), maxAge: SESSION_TTL_MS })
}

function readCookie(req, name) {
  const header = req.headers.cookie
  if (!header) return null
  for (const part of header.split(';')) {
    const eq = part.indexOf('=')
    if (eq !== -1 && part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim()
  }
  return null
}

/** The signed-in user as { id, name }, or null for a guest or a bad cookie. */
function readSession(req) {
  if (!sessionsEnabled) return null
  const token = readCookie(req, SESSION_COOKIE)
  if (!token) return null

  const [payload, mac] = token.split('.')
  if (!payload || !mac) return null
  const expected = Buffer.from(sign(payload))
  const given = Buffer.from(mac)
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (typeof session.sub !== 'string' || typeof session.name !== 'string') return null
    if (!(session.exp > Date.now())) return null
    return { id: session.sub, name: session.name }
  } catch {
    return null
  }
}

function callerId(req) {
  return readSession(req)?.id ?? null
}

// ---------------------------------------------------------------------------
// Passwords. scrypt ships with Node, so there is no native module to build on
// App Service. The stored string carries its own parameters and salt, so the
// cost can be raised later without invalidating existing hashes.
// ---------------------------------------------------------------------------
const scrypt = promisify(crypto.scrypt)
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 }
const SCRYPT_KEYLEN = 64

async function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  const hash = await scrypt(password, salt, SCRYPT_KEYLEN, SCRYPT_PARAMS)
  const { N, r, p } = SCRYPT_PARAMS
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${hash.toString('base64')}`
}

async function verifyPassword(password, stored) {
  const [algorithm, N, r, p, salt, hash] = stored.split('$')
  if (algorithm !== 'scrypt' || !salt || !hash) return false
  const expected = Buffer.from(hash, 'base64')
  const actual = await scrypt(password, Buffer.from(salt, 'base64'), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
  })
  return crypto.timingSafeEqual(actual, expected)
}

// Checked against when a username is unknown, so a miss takes as long as a
// wrong password and response timing says nothing about which usernames exist.
const decoyHash = hashPassword(crypto.randomUUID())

// Same rules the sign-up form shows. Usernames are stored lowercase, so
// "Batman" and "batman" are one account.
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/
const PASSWORD_MIN = 8
const PASSWORD_MAX = 128

function readCredentials(body) {
  if (!body || typeof body !== 'object') return null
  const { username, password } = body
  if (typeof username !== 'string' || typeof password !== 'string') return null
  return { username: username.trim().toLowerCase(), password }
}

// ---------------------------------------------------------------------------
// Rate limiting. F1 gives 60 CPU-minutes a day and the SQL free offer gives
// 100,000 vCore-seconds a month — a hot loop from one client could burn either.
// In-memory is sufficient because Free and Shared tiers run a single instance;
// revisit if you ever scale out.
// ---------------------------------------------------------------------------

// App Service can forward the client address with its port attached, which
// would give every new connection a fresh bucket. Strip it.
function clientIp(req) {
  const ip = req.ip ?? ''
  return ip.match(/^(\d+\.\d+\.\d+\.\d+):\d+$/)?.[1] ?? ip.match(/^\[(.+)\]:\d+$/)?.[1] ?? ip
}

function rateLimiter({ windowMs, max }) {
  const hits = new Map()

  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of hits) {
      if (now > entry.resetAt) hits.delete(key)
    }
  }, windowMs).unref()

  return function rateLimit(req, res, next) {
    const key = callerId(req) ?? clientIp(req)
    const now = Date.now()
    const entry = hits.get(key)

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }
    if (entry.count >= max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000))
      return res.status(429).json({ error: 'Too many requests' })
    }
    entry.count += 1
    return next()
  }
}

const rateLimit = rateLimiter({ windowMs: 60_000, max: 120 })
// Sign-up and sign-in get a much tighter budget: each attempt runs scrypt, and
// a password guesser should run out of tries long before it runs out of guesses.
const authRateLimit = rateLimiter({ windowMs: 15 * 60_000, max: 20 })

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
// Auth API
//
// dbo.users has no Row Level Security: sign-in has to find a row before it
// knows who the caller is. The ids it hands out are the user_id values that
// game_settings and its RLS predicate key on.
//
// SameSite=Lax keeps the cookie off cross-site POST and PUT requests, and
// express.json only parses application/json, which a cross-site form cannot
// send. Between them, another site cannot drive these endpoints or the
// settings API with a host's session.
// ---------------------------------------------------------------------------
const authJson = express.json({ limit: '4kb' })

// SQL Server returns uniqueidentifier in upper case; one canonical form keeps
// the id in a cookie identical to the one stored in game_settings.
const userIdOf = (row) => String(row.id).toLowerCase()

app.get('/api/auth/me', rateLimit, (req, res) => {
  const user = readSession(req)
  res.setHeader('Cache-Control', 'no-store')
  if (!user) return res.sendStatus(204)
  return res.json(user)
})

app.post('/api/auth/signup', authRateLimit, authJson, async (req, res) => {
  if (!sessionsEnabled) return res.sendStatus(503)

  const credentials = readCredentials(req.body)
  if (!credentials) return res.status(400).json({ error: 'Expected a username and password' })
  const { username, password } = credentials
  if (!USERNAME_PATTERN.test(username)) {
    return res.status(400).json({ error: 'Usernames are 3-20 letters, numbers, or underscores' })
  }
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return res.status(400).json({ error: `Passwords are ${PASSWORD_MIN}-${PASSWORD_MAX} characters` })
  }

  try {
    const passwordHash = await hashPassword(password)
    const pool = await getPool()
    const result = await pool
      .request()
      .input('username', sql.VarChar(20), username)
      .input('hash', sql.VarChar(256), passwordHash)
      .query(`
        INSERT INTO dbo.users (username, password_hash)
        OUTPUT inserted.id
        VALUES (@username, @hash);
      `)

    const user = { id: userIdOf(result.recordset[0]), name: username }
    issueSession(req, res, user)
    return res.status(201).json(user)
  } catch (error) {
    // 2627 / 2601: the unique constraint on username, including the case where
    // two sign-ups for the same name race each other.
    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({ error: 'Username taken' })
    }
    console.error('POST /api/auth/signup failed:', error.message)
    return res.sendStatus(503)
  }
})

app.post('/api/auth/login', authRateLimit, authJson, async (req, res) => {
  if (!sessionsEnabled) return res.sendStatus(503)

  const credentials = readCredentials(req.body)
  if (!credentials) return res.status(400).json({ error: 'Expected a username and password' })
  const { username, password } = credentials
  // A name that breaks the rules cannot exist, so there is nothing to look up.
  if (!USERNAME_PATTERN.test(username) || password.length > PASSWORD_MAX) {
    return res.status(401).json({ error: 'Incorrect username or password' })
  }

  try {
    const pool = await getPool()
    const result = await pool
      .request()
      .input('username', sql.VarChar(20), username)
      .query(`
        SELECT id, username, password_hash FROM dbo.users
         WHERE username = @username;
      `)

    const row = result.recordset?.[0]
    const valid = await verifyPassword(password, row?.password_hash ?? (await decoyHash))
    if (!row || !valid) return res.status(401).json({ error: 'Incorrect username or password' })

    const user = { id: userIdOf(row), name: row.username }
    issueSession(req, res, user)
    return res.json(user)
  } catch (error) {
    console.error('POST /api/auth/login failed:', error.message)
    return res.sendStatus(503)
  }
})

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE, cookieOptions(req))
  return res.sendStatus(204)
})

// ---------------------------------------------------------------------------
// Settings API
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

// ---------------------------------------------------------------------------
// Images API — pictures attached to Jeopardy clues ("guess the brand").
//
// The bytes live in dbo.clue_images, under the same RLS predicate as
// game_settings, and the board JSON carries only the /api/images/<id> link
// this returns. That keeps every autosave small. An id never points at
// different bytes later, so browsers may cache each picture for good.
// ---------------------------------------------------------------------------
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMAGE_BYTES = 300 * 1024
const MAX_IMAGES_PER_USER = 150
const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

// Reads the type from the file's own first bytes. Uploads must match what they
// claim to be, so nothing that is secretly HTML or script gets served back.
// SVG is left out on purpose: it can carry script.
function sniffImageType(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.length >= 8 && buf.subarray(0, 8).equals(PNG_SIGNATURE)) return 'image/png'
  if (buf.length >= 12 && buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') {
    return 'image/webp'
  }
  if (buf.length >= 6 && /^GIF8[79]a$/.test(buf.toString('latin1', 0, 6))) return 'image/gif'
  return null
}

app.post(
  '/api/images',
  rateLimit,
  express.raw({ type: IMAGE_TYPES, limit: MAX_IMAGE_BYTES }),
  async (req, res) => {
    const userId = callerId(req)
    if (!userId) return res.sendStatus(401)

    // express.raw leaves req.body unset for any other content type.
    const declared = req.get('content-type')?.split(';')[0].trim().toLowerCase()
    const type = Buffer.isBuffer(req.body) ? sniffImageType(req.body) : null
    if (!type || type !== declared) {
      return res.status(415).json({ error: 'Expected a JPEG, PNG, WebP, or GIF image' })
    }

    try {
      const pool = await getPool()
      // The count and the insert run in one batch; at most one insert per
      // request, so a race can overshoot the cap by a picture or two at worst.
      const result = await pool
        .request()
        .input('uid', sql.NVarChar(128), userId)
        .input('type', sql.VarChar(32), type)
        .input('data', sql.VarBinary(sql.MAX), req.body)
        .input('max', sql.Int, MAX_IMAGES_PER_USER)
        .query(`
          EXEC sp_set_session_context @key = N'user_id', @value = @uid;
          IF (SELECT COUNT(*) FROM dbo.clue_images WHERE user_id = @uid) < @max
            INSERT INTO dbo.clue_images (user_id, content_type, data)
            OUTPUT inserted.id
            VALUES (@uid, @type, @data);
        `)

      const row = result.recordset?.[0]
      if (!row) return res.status(409).json({ error: 'Picture limit reached' })
      return res.status(201).json({ url: `/api/images/${String(row.id).toLowerCase()}` })
    } catch (error) {
      console.error('POST /api/images failed:', error.message)
      return res.sendStatus(503)
    }
  },
)

app.get('/api/images/:id', rateLimit, async (req, res) => {
  const userId = callerId(req)
  if (!userId) return res.sendStatus(401)
  if (!GUID_PATTERN.test(req.params.id)) return res.sendStatus(404)

  try {
    const pool = await getPool()
    const result = await pool
      .request()
      .input('uid', sql.NVarChar(128), userId)
      .input('id', sql.UniqueIdentifier, req.params.id)
      .query(`
        EXEC sp_set_session_context @key = N'user_id', @value = @uid;
        SELECT content_type, data FROM dbo.clue_images
         WHERE id = @id AND user_id = @uid;
      `)

    const row = result.recordset?.[0]
    if (!row) return res.sendStatus(404)

    // private: only this host's browser may cache it, never a shared proxy.
    res.setHeader('Cache-Control', 'private, max-age=31536000, immutable')
    return res.type(row.content_type).send(row.data)
  } catch (error) {
    console.error('GET /api/images failed:', error.message)
    return res.sendStatus(503)
  }
})

app.delete('/api/images/:id', rateLimit, async (req, res) => {
  const userId = callerId(req)
  if (!userId) return res.sendStatus(401)
  if (!GUID_PATTERN.test(req.params.id)) return res.sendStatus(404)

  try {
    const pool = await getPool()
    await pool
      .request()
      .input('uid', sql.NVarChar(128), userId)
      .input('id', sql.UniqueIdentifier, req.params.id)
      .query(`
        EXEC sp_set_session_context @key = N'user_id', @value = @uid;
        DELETE FROM dbo.clue_images WHERE id = @id AND user_id = @uid;
      `)
    return res.sendStatus(204)
  } catch (error) {
    console.error('DELETE /api/images failed:', error.message)
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

// Last-resort handler: log the detail, tell the client nothing useful. Client
// errors raised by middleware, such as malformed JSON from express.json, keep
// their 4xx status instead of being reported as a server fault.
app.use((error, _req, res, _next) => {
  console.error('Unhandled error:', error.message)
  const status = error.status >= 400 && error.status < 500 ? error.status : 500
  res.sendStatus(status)
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`IceBrk listening on ${port}`)
})

-- ============================================================================
-- IceBrk — Azure SQL schema (Azure SQL Database free offer)
--
-- The record of what was run against the `icebrk-test` database on the
-- `sql-icebrk-test` logical server. One table covers all six games, Row
-- Level Security restores the per-host isolation the previous Postgres
-- policies provided (that schema lives on in git history), dbo.users holds
-- the username + password accounts that server.js signs hosts in with, and
-- dbo.clue_images holds pictures attached to Jeopardy clues.
--
-- The Azure portal query editor has no GO batch separator, so run each
-- numbered block as its own execution.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Grant the App Service managed identity access.
--    Run as the Microsoft Entra admin of the logical server. No password is
--    involved: FROM EXTERNAL PROVIDER resolves the name against Entra ID, and
--    the name must match the web app's resource name exactly.
-- ---------------------------------------------------------------------------
CREATE USER [icebrk-app] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datareader ADD MEMBER [icebrk-app];
ALTER ROLE db_datawriter ADD MEMBER [icebrk-app];

-- ---------------------------------------------------------------------------
-- 2. One table for every game. game_id says which game, payload holds what
--    used to live in the Postgres jsonb columns, and the ISJSON constraint
--    keeps malformed text out of the column.
-- ---------------------------------------------------------------------------
CREATE TABLE dbo.game_settings (
  user_id     nvarchar(128) NOT NULL,   -- dbo.users.id, as lowercase GUID text
  game_id     varchar(32)   NOT NULL,   -- roulette | jeopardy | bingo | ...
  payload     nvarchar(max) NOT NULL
    CONSTRAINT ck_game_settings_json CHECK (ISJSON(payload) = 1),
  updated_at  datetime2     NOT NULL
    CONSTRAINT df_game_settings_updated DEFAULT sysutcdatetime(),
  CONSTRAINT pk_game_settings PRIMARY KEY (user_id, game_id)
);

-- ---------------------------------------------------------------------------
-- 3. The security predicate. Equivalent to the old `auth.uid() = user_id`:
--    a row is visible only when it matches the identity the connection
--    declared through sp_set_session_context.
--
--    CREATE FUNCTION must be the first statement in its batch — run alone.
-- ---------------------------------------------------------------------------
CREATE FUNCTION dbo.fn_rls_current_user(@user_id nvarchar(128))
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN SELECT 1 AS allowed
WHERE @user_id = CAST(SESSION_CONTEXT(N'user_id') AS nvarchar(128));

-- ---------------------------------------------------------------------------
-- 4. Attach the policy.
--    FILTER hides other hosts' rows from reads.
--    BLOCK ... AFTER INSERT stops a write stamped with someone else's id.
--
--    The predicate is an inline table-valued function, so the app's user needs
--    SELECT on it (EXECUTE applies to scalar functions and procedures).
-- ---------------------------------------------------------------------------
CREATE SECURITY POLICY dbo.game_settings_rls
  ADD FILTER PREDICATE dbo.fn_rls_current_user(user_id) ON dbo.game_settings,
  ADD BLOCK PREDICATE  dbo.fn_rls_current_user(user_id) ON dbo.game_settings AFTER INSERT
  WITH (STATE = ON);

GRANT SELECT ON dbo.fn_rls_current_user TO [icebrk-app];

-- ---------------------------------------------------------------------------
-- 5. Host accounts, for username + password sign-in (added October 2026, when
--    sign-in moved off Easy Auth and Microsoft accounts).
--
--    Usernames are stored lowercase and unique. password_hash is a
--    self-describing scrypt string (scrypt$N$r$p$salt$hash) written by
--    server.js; the database never sees a plain password. There is no RLS
--    here, because sign-in has to read the row before it knows who is asking.
--    db_datareader / db_datawriter from block 1 already cover this table.
-- ---------------------------------------------------------------------------
CREATE TABLE dbo.users (
  id             uniqueidentifier NOT NULL
    CONSTRAINT df_users_id DEFAULT newid(),
  username       varchar(20)      NOT NULL,   -- 3-20 of a-z 0-9 _
  password_hash  varchar(256)     NOT NULL,
  created_at     datetime2        NOT NULL
    CONSTRAINT df_users_created DEFAULT sysutcdatetime(),
  CONSTRAINT pk_users PRIMARY KEY (id),
  CONSTRAINT uq_users_username UNIQUE (username)
);

-- ---------------------------------------------------------------------------
-- 6. Pictures on Jeopardy clues ("guess the brand"), added October 2026.
--
--    The board JSON in game_settings stores only a short /api/images/<id>
--    link, so autosave stays small; the bytes live here. The browser resizes
--    each picture to at most 1024px before upload, and the API caps a file at
--    300 KB and a host at 150 pictures. The same RLS predicate as
--    game_settings keeps each host's pictures to themselves.
--
--    Run 6a, 6b, and 6c as three separate executions.
-- ---------------------------------------------------------------------------

-- 6a. The table.
CREATE TABLE dbo.clue_images (
  id            uniqueidentifier NOT NULL
    CONSTRAINT df_clue_images_id DEFAULT newid(),
  user_id       nvarchar(128)    NOT NULL,   -- dbo.users.id, as lowercase GUID text
  content_type  varchar(32)      NOT NULL
    CONSTRAINT ck_clue_images_type
      CHECK (content_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif')),
  data          varbinary(max)   NOT NULL,
  created_at    datetime2        NOT NULL
    CONSTRAINT df_clue_images_created DEFAULT sysutcdatetime(),
  CONSTRAINT pk_clue_images PRIMARY KEY (id)
);

-- 6b. Counting a host's pictures for the 150 cap reads by user_id.
CREATE INDEX ix_clue_images_user ON dbo.clue_images (user_id);

-- 6c. Row Level Security, reusing the predicate function from block 3.
--     db_datareader / db_datawriter from block 1 already cover the table.
CREATE SECURITY POLICY dbo.clue_images_rls
  ADD FILTER PREDICATE dbo.fn_rls_current_user(user_id) ON dbo.clue_images,
  ADD BLOCK PREDICATE  dbo.fn_rls_current_user(user_id) ON dbo.clue_images AFTER INSERT
  WITH (STATE = ON);

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- SELECT name, type_desc, authentication_type_desc
--   FROM sys.database_principals WHERE name = 'icebrk-app';   -- EXTERNAL_USER
-- SELECT name, is_enabled FROM sys.security_policies;         -- game_settings_rls / 1, clue_images_rls / 1
-- SELECT COUNT(*) FROM dbo.users;                              -- runs, no RLS

-- ---------------------------------------------------------------------------
-- Reading data as an administrator
--
-- RLS applies to db_owner too, so a plain SELECT returns zero rows because the
-- session has declared no identity. Either adopt an identity first:
--
--   EXEC sp_set_session_context @key = N'user_id', @value = N'<principal id>';
--   SELECT * FROM dbo.game_settings;
--
-- or lift the policy briefly, and put it back:
--
--   ALTER SECURITY POLICY dbo.game_settings_rls WITH (STATE = OFF);
--   ALTER SECURITY POLICY dbo.game_settings_rls WITH (STATE = ON);
-- ---------------------------------------------------------------------------

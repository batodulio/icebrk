-- ============================================================================
-- IceBrk — Azure SQL schema (Azure SQL Database free offer)
--
-- The record of what was run against the `icebrk-test` database on the
-- `sql-icebrk-test` logical server. One table covers all six games, and Row
-- Level Security restores the per-host isolation the previous Postgres
-- policies provided (that schema lives on in git history).
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
  user_id     nvarchar(128) NOT NULL,   -- Easy Auth principal id (stable object id)
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
-- Verify
-- ---------------------------------------------------------------------------
-- SELECT name, type_desc, authentication_type_desc
--   FROM sys.database_principals WHERE name = 'icebrk-app';   -- EXTERNAL_USER
-- SELECT name, is_enabled FROM sys.security_policies;         -- game_settings_rls / 1

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

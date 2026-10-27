-- =====================================================================
-- Legacy apps (Laravel) -> 1 Postgres chung, má»—i web 1 schema + 1 role
--   nghenoithat.vn       -> schema nghenoithat   / role nghenoithat_app
--   vietnambim.com       -> schema vietnambim    / role vietnambim_app
--   app.netzero2050.vn   -> schema netzero_app   / role netzero_app_user
-- Cháº¡y báº±ng superuser (postgres). Idempotent: cháº¡y láº¡i nhiá»u láº§n khĂ´ng lá»—i.
-- Máº­t kháº©u role Ä‘Æ°á»£c truyá»n qua biáº¿n psql:
--   psql -v nghenoithat_pw=... -v vietnambim_pw=... -v netzero_pw=... -f 01_legacy_schemas.sql
-- =====================================================================

\set ON_ERROR_STOP on

-- ---------- Roles ----------
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', 'nghenoithat_app', :'nghenoithat_pw')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'nghenoithat_app') \gexec
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', 'vietnambim_app', :'vietnambim_pw')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vietnambim_app') \gexec
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', 'netzero_app_user', :'netzero_pw')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'netzero_app_user') \gexec

ALTER ROLE nghenoithat_app  PASSWORD :'nghenoithat_pw';
ALTER ROLE vietnambim_app   PASSWORD :'vietnambim_pw';
ALTER ROLE netzero_app_user PASSWORD :'netzero_pw';

-- ---------- Schemas ----------
CREATE SCHEMA IF NOT EXISTS nghenoithat AUTHORIZATION nghenoithat_app;
CREATE SCHEMA IF NOT EXISTS vietnambim  AUTHORIZATION vietnambim_app;
CREATE SCHEMA IF NOT EXISTS netzero_app AUTHORIZATION netzero_app_user;

-- Má»—i role chá»‰ tháº¥y schema cá»§a mĂ¬nh (khĂ´ng Ä‘á»c Ä‘Æ°á»£c public / schema web khĂ¡c)
REVOKE ALL ON SCHEMA public FROM nghenoithat_app, vietnambim_app, netzero_app_user;
REVOKE ALL ON SCHEMA nghenoithat FROM PUBLIC;
REVOKE ALL ON SCHEMA vietnambim  FROM PUBLIC;
REVOKE ALL ON SCHEMA netzero_app FROM PUBLIC;

-- search_path máº·c Ä‘á»‹nh: schema riĂªng trÆ°á»›c, pg_catalog sau
-- (Ä‘á»ƒ cĂ¡c hĂ m tÆ°Æ¡ng thĂ­ch MySQL bĂªn dÆ°á»›i Ä‘Æ°á»£c Æ°u tiĂªn)
ALTER ROLE nghenoithat_app  SET search_path = nghenoithat, pg_catalog;
ALTER ROLE vietnambim_app   SET search_path = vietnambim, pg_catalog;
ALTER ROLE netzero_app_user SET search_path = netzero_app, pg_catalog;

-- ---------- HĂ m tÆ°Æ¡ng thĂ­ch MySQL (táº¡o trong tá»«ng schema) ----------
DO $do$
DECLARE s text;
BEGIN
  FOREACH s IN ARRAY ARRAY['nghenoithat', 'vietnambim', 'netzero_app'] LOOP
    -- YEAR() / MONTH() / DAY()
    EXECUTE format($f$CREATE OR REPLACE FUNCTION %I.year(d timestamp) RETURNS integer
      LANGUAGE sql IMMUTABLE AS 'SELECT EXTRACT(YEAR FROM d)::int'$f$, s);
    EXECUTE format($f$CREATE OR REPLACE FUNCTION %I.year(d date) RETURNS integer
      LANGUAGE sql IMMUTABLE AS 'SELECT EXTRACT(YEAR FROM d)::int'$f$, s);
    EXECUTE format($f$CREATE OR REPLACE FUNCTION %I.year(d timestamptz) RETURNS integer
      LANGUAGE sql STABLE AS 'SELECT EXTRACT(YEAR FROM d)::int'$f$, s);
    EXECUTE format($f$CREATE OR REPLACE FUNCTION %I.month(d timestamp) RETURNS integer
      LANGUAGE sql IMMUTABLE AS 'SELECT EXTRACT(MONTH FROM d)::int'$f$, s);
    EXECUTE format($f$CREATE OR REPLACE FUNCTION %I.month(d date) RETURNS integer
      LANGUAGE sql IMMUTABLE AS 'SELECT EXTRACT(MONTH FROM d)::int'$f$, s);
    EXECUTE format($f$CREATE OR REPLACE FUNCTION %I.month(d timestamptz) RETURNS integer
      LANGUAGE sql STABLE AS 'SELECT EXTRACT(MONTH FROM d)::int'$f$, s);
    EXECUTE format($f$CREATE OR REPLACE FUNCTION %I.day(d timestamp) RETURNS integer
      LANGUAGE sql IMMUTABLE AS 'SELECT EXTRACT(DAY FROM d)::int'$f$, s);
    EXECUTE format($f$CREATE OR REPLACE FUNCTION %I.day(d date) RETURNS integer
      LANGUAGE sql IMMUTABLE AS 'SELECT EXTRACT(DAY FROM d)::int'$f$, s);

    -- IFNULL()
    EXECUTE format($f$CREATE OR REPLACE FUNCTION %I.ifnull(a anyelement, b anyelement) RETURNS anyelement
      LANGUAGE sql IMMUTABLE AS 'SELECT COALESCE(a, b)'$f$, s);

    -- Ă‰p chuá»—i -> sá»‘ "dá»… tĂ­nh" nhÆ° MySQL ('' / NULL / chá»¯ -> 0, '1,5' -> 1.5)
    EXECUTE format($f$CREATE OR REPLACE FUNCTION %I.mysql_num(v text) RETURNS numeric
      LANGUAGE plpgsql IMMUTABLE AS $b$
      BEGIN
        IF v IS NULL OR btrim(v) = '' THEN RETURN 0; END IF;
        RETURN replace(btrim(v), ',', '.')::numeric;
      EXCEPTION WHEN others THEN
        RETURN COALESCE(substring(replace(btrim(v), ',', '.') FROM '^-?[0-9]+(\.[0-9]+)?')::numeric, 0);
      END $b$ $f$, s);

    -- SUM(varchar) / AVG(varchar): MySQL tá»± Ă©p kiá»ƒu, Postgres thĂ¬ khĂ´ng
    EXECUTE format($f$CREATE OR REPLACE FUNCTION %I.mysql_sum_sfunc(acc numeric, v text) RETURNS numeric
      LANGUAGE sql IMMUTABLE AS 'SELECT CASE WHEN v IS NULL THEN acc ELSE COALESCE(acc, 0) + %I.mysql_num(v) END'$f$, s, s);
    EXECUTE format('DROP AGGREGATE IF EXISTS %I.sum(text)', s);
    EXECUTE format('CREATE AGGREGATE %I.sum(text) (SFUNC = %I.mysql_sum_sfunc, STYPE = numeric)', s, s);
    EXECUTE format('DROP AGGREGATE IF EXISTS %I.sum(varchar)', s);
    EXECUTE format('CREATE AGGREGATE %I.sum(varchar) (SFUNC = %I.mysql_sum_sfunc, STYPE = numeric)', s, s);
  END LOOP;
END $do$;

ALTER FUNCTION nghenoithat.mysql_num(text) OWNER TO nghenoithat_app;
ALTER FUNCTION vietnambim.mysql_num(text)  OWNER TO vietnambim_app;
ALTER FUNCTION netzero_app.mysql_num(text) OWNER TO netzero_app_user;

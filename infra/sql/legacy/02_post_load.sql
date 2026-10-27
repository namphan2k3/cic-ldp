-- =====================================================================
-- Chạy SAU pgloader: trả lại search_path mặc định của DB + giao quyền sở hữu
-- toàn bộ bảng/sequence/view trong schema cho role của từng web.
-- =====================================================================
\set ON_ERROR_STOP on

-- pgloader tự thêm các schema legacy vào search_path của cả database
-- -> gỡ ra để cic-web / landing-hub / data-hub không bị ảnh hưởng
ALTER DATABASE postgres RESET search_path;

DO $do$
DECLARE
  m record;
  o record;
BEGIN
  FOR m IN SELECT * FROM (VALUES
      ('nghenoithat', 'nghenoithat_app'),
      ('vietnambim',  'vietnambim_app'),
      ('netzero_app', 'netzero_app_user')) AS t(schema_name, role_name)
  LOOP
    EXECUTE format('ALTER SCHEMA %I OWNER TO %I', m.schema_name, m.role_name);

    FOR o IN
      SELECT c.relname, c.relkind
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = m.schema_name AND c.relkind IN ('r', 'p', 'v', 'm', 'S', 'f')
        -- sequence gắn với cột (serial/identity) tự đổi chủ theo bảng
        AND NOT (c.relkind = 'S' AND EXISTS (
          SELECT 1 FROM pg_depend d
          WHERE d.objid = c.oid AND d.classid = 'pg_class'::regclass AND d.deptype IN ('a', 'i')))
      ORDER BY CASE c.relkind WHEN 'S' THEN 1 ELSE 0 END
    LOOP
      EXECUTE format(
        'ALTER %s %I.%I OWNER TO %I',
        CASE o.relkind WHEN 'S' THEN 'SEQUENCE' WHEN 'v' THEN 'VIEW'
                       WHEN 'm' THEN 'MATERIALIZED VIEW' WHEN 'f' THEN 'FOREIGN TABLE'
                       ELSE 'TABLE' END,
        m.schema_name, o.relname, m.role_name);
    END LOOP;

    FOR o IN
      SELECT p.oid::regprocedure AS sig, p.prokind
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = m.schema_name
    LOOP
      EXECUTE format('ALTER %s %s OWNER TO %I',
        CASE o.prokind WHEN 'a' THEN 'AGGREGATE' ELSE 'FUNCTION' END, o.sig, m.role_name);
    END LOOP;

    FOR o IN
      SELECT t.typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = m.schema_name AND t.typtype IN ('e', 'd')
    LOOP
      EXECUTE format('ALTER TYPE %I.%I OWNER TO %I', m.schema_name, o.typname, m.role_name);
    END LOOP;
  END LOOP;
END $do$;

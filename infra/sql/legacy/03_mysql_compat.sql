-- =====================================================================
-- Giả lập hành vi MySQL để code Laravel cũ chạy nguyên vẹn trên Postgres
-- =====================================================================
\set ON_ERROR_STOP on

-- 1) nghenoithat + vietnambim chạy MySQL 'strict' => false:
--    MySQL tự điền giá trị rỗng khi INSERT thiếu cột NOT NULL, Postgres thì báo lỗi.
--    -> bỏ NOT NULL trên mọi cột không thuộc khoá chính.
DO $do$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT col.table_schema, col.table_name, col.column_name
    FROM information_schema.columns col
    JOIN information_schema.tables t
      ON t.table_schema = col.table_schema AND t.table_name = col.table_name AND t.table_type = 'BASE TABLE'
    WHERE col.table_schema IN ('nghenoithat', 'vietnambim')
      AND col.is_nullable = 'NO'
      AND NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage k
          ON k.constraint_name = tc.constraint_name AND k.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = col.table_schema AND tc.table_name = col.table_name
          AND k.column_name = col.column_name)
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN %I DROP NOT NULL', c.table_schema, c.table_name, c.column_name);
  END LOOP;
END $do$;

-- 2) MySQL so sánh chuỗi không phân biệt hoa/thường (collation *_ci).
--    Quan trọng nhất là đăng nhập bằng email -> chuyển users.email sang citext.
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO nghenoithat_app, vietnambim_app, netzero_app_user;

ALTER TABLE nghenoithat.users ALTER COLUMN email TYPE extensions.citext;
ALTER TABLE vietnambim.users  ALTER COLUMN email TYPE extensions.citext;
ALTER TABLE netzero_app.users ALTER COLUMN email TYPE extensions.citext;

-- toán tử citext nằm trong schema extensions -> thêm vào search_path (sau schema riêng)
ALTER ROLE nghenoithat_app  SET search_path = nghenoithat, extensions, pg_catalog;
ALTER ROLE vietnambim_app   SET search_path = vietnambim, extensions, pg_catalog;
ALTER ROLE netzero_app_user SET search_path = netzero_app, extensions, pg_catalog;

-- 3) Thứ tự sắp xếp chữ giống MySQL utf8mb4_unicode_ci (Đ cạnh D, Ă cạnh A, không xếp theo byte)
--    DB đang dùng en_US.utf8 trên Alpine (thực chất là thứ tự byte) -> chuyển cột chữ sang ICU "und-x-icu"
DO $do$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT col.table_schema, col.table_name, col.column_name, col.data_type, col.character_maximum_length
    FROM information_schema.columns col
    JOIN information_schema.tables t
      ON t.table_schema = col.table_schema AND t.table_name = col.table_name AND t.table_type = 'BASE TABLE'
    WHERE col.table_schema IN ('nghenoithat', 'vietnambim', 'netzero_app')
      AND col.data_type IN ('text', 'character varying', 'character')
      AND COALESCE(col.collation_name, '') <> 'und-x-icu'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN %I TYPE %s COLLATE "und-x-icu"',
      c.table_schema, c.table_name, c.column_name,
      CASE c.data_type
        WHEN 'text' THEN 'text'
        WHEN 'character varying' THEN COALESCE('varchar(' || c.character_maximum_length || ')', 'varchar')
        ELSE COALESCE('char(' || c.character_maximum_length || ')', 'char')
      END);
  END LOOP;
END $do$;

-- 4) Cột CHAR(n): MySQL tự cắt khoảng trắng cuối khi đọc, Postgres giữ nguyên (hiện "     ")
--    -> đổi sang varchar(n) và cắt khoảng trắng cuối của dữ liệu cũ
DO $do$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT col.table_schema, col.table_name, col.column_name, col.character_maximum_length AS len
    FROM information_schema.columns col
    JOIN information_schema.tables t
      ON t.table_schema = col.table_schema AND t.table_name = col.table_name AND t.table_type = 'BASE TABLE'
    WHERE col.table_schema IN ('nghenoithat', 'vietnambim', 'netzero_app')
      AND col.data_type = 'character'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN %I TYPE varchar(%s) COLLATE "und-x-icu" USING rtrim(%I)',
      c.table_schema, c.table_name, c.column_name, c.len, c.column_name);
  END LOOP;
END $do$;

-- 5) Cột id kiểu số mà mất AUTO_INCREMENT khi chuyển (pgloader bỏ sót ở một số bảng)
--    -> tạo sequence, gắn DEFAULT nextval, đặt giá trị tiếp theo = max(id) + 1
DO $do$
DECLARE c record; seq text; mx bigint;
BEGIN
  FOR c IN
    SELECT col.table_schema, col.table_name
    FROM information_schema.columns col
    JOIN information_schema.tables t
      ON t.table_schema = col.table_schema AND t.table_name = col.table_name AND t.table_type = 'BASE TABLE'
    WHERE col.table_schema IN ('nghenoithat', 'vietnambim', 'netzero_app')
      AND col.column_name = 'id'
      AND col.data_type IN ('integer', 'bigint', 'smallint')
      AND col.column_default IS NULL AND col.is_identity = 'NO'
  LOOP
    seq := c.table_name || '_id_seq';
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I.%I', c.table_schema, seq);
    EXECUTE format('ALTER SEQUENCE %I.%I OWNER TO %I', c.table_schema, seq,
      (SELECT pg_get_userbyid(relowner) FROM pg_class WHERE oid = (quote_ident(c.table_schema) || '.' || quote_ident(c.table_name))::regclass));
    EXECUTE format('ALTER SEQUENCE %I.%I OWNED BY %I.%I.id', c.table_schema, seq, c.table_schema, c.table_name);
    EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN id SET DEFAULT nextval(%L)', c.table_schema, c.table_name, c.table_schema || '.' || seq);
    EXECUTE format('SELECT COALESCE(max(id), 0) FROM %I.%I', c.table_schema, c.table_name) INTO mx;
    EXECUTE format('SELECT setval(%L, %s, %s)', c.table_schema || '.' || seq, GREATEST(mx, 1), CASE WHEN mx > 0 THEN 'true' ELSE 'false' END);
  END LOOP;
END $do$;

-- Đặt lại mọi sequence = max(id) để INSERT tiếp theo không trùng khoá
DO $do$
DECLARE s record; mx bigint;
BEGIN
  FOR s IN
    SELECT n.nspname AS sch, t.relname AS tbl, a.attname AS col, pg_get_serial_sequence(quote_ident(n.nspname) || '.' || quote_ident(t.relname), a.attname) AS seq
    FROM pg_class t JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum > 0 AND NOT a.attisdropped
    WHERE n.nspname IN ('nghenoithat', 'vietnambim', 'netzero_app') AND t.relkind = 'r'
      AND pg_get_serial_sequence(quote_ident(n.nspname) || '.' || quote_ident(t.relname), a.attname) IS NOT NULL
  LOOP
    EXECUTE format('SELECT COALESCE(max(%I), 0) FROM %I.%I', s.col, s.sch, s.tbl) INTO mx;
    PERFORM setval(s.seq, GREATEST(mx, 1), mx > 0);
  END LOOP;
END $do$;

-- Sequence mới tạo thuộc postgres -> giao lại cho role của từng web
DO $do$
DECLARE o record;
BEGIN
  FOR o IN
    SELECT n.nspname, c.relname,
      CASE n.nspname WHEN 'nghenoithat' THEN 'nghenoithat_app' WHEN 'vietnambim' THEN 'vietnambim_app' ELSE 'netzero_app_user' END AS role_name
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname IN ('nghenoithat', 'vietnambim', 'netzero_app') AND c.relkind = 'S'
      AND pg_get_userbyid(c.relowner) = 'postgres'
      AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = c.oid AND d.classid = 'pg_class'::regclass AND d.deptype IN ('a', 'i'))
  LOOP
    EXECUTE format('ALTER SEQUENCE %I.%I OWNER TO %I', o.nspname, o.relname, o.role_name);
  END LOOP;
END $do$;

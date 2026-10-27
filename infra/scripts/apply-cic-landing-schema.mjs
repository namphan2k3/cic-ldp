import fs from 'node:fs';
import path from 'node:path';
import postgres from '../../node_modules/postgres/src/index.js';

const sqlPath = new URL('../sql/cic_landing/01_cic_landing_schema.sql', import.meta.url);
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

const sql = postgres({
  host: '127.0.0.1',
  port: 54322,
  user: 'postgres',
  password: 'cic_supabase_2026',
  database: 'postgres',
  ssl: false,
});

async function main() {
  console.log('Applying cic_landing schema...');
  try {
    await sql.unsafe(sqlContent);
    console.log('Schema applied successfully!');

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'cic_landing' 
      ORDER BY table_name;
    `;
    console.log('Created tables in cic_landing (' + tables.length + '):');
    tables.forEach(t => console.log(' - ' + t.table_name));
  } catch (err) {
    console.error('Error applying schema:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();

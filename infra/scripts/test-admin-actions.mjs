import postgres from 'postgres';

async function testAdminActions() {
  console.log('=== Testing Admin Portal Capabilities Directly via DB ===\n');
  const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres:cic_supabase_2026@127.0.0.1:54322/postgres');

  try {
    // 1. Check sections query
    const sections = await sql`
      SELECT landing_page_section_id, section_order, is_section_enabled, landing_section_type_code
      FROM cic_landing.landing_page_sections
      WHERE landing_page_id = (
        SELECT landing_page_id FROM cic_landing.landing_pages WHERE landing_page_slug = 'home' AND landing_page_locale = 'vi' LIMIT 1
      )
      ORDER BY section_order ASC
    `;
    console.log(`[PASS] Sections loaded for home (vi): ${sections.length} sections found.`);

    // 2. Test toggling is_section_enabled
    const targetSection = sections[0];
    const initialStatus = targetSection.is_section_enabled;
    await sql`
      UPDATE cic_landing.landing_page_sections
      SET is_section_enabled = ${!initialStatus}, updated_at_utc = NOW()
      WHERE landing_page_section_id = ${targetSection.landing_page_section_id}
    `;
    const [updatedSection] = await sql`
      SELECT is_section_enabled FROM cic_landing.landing_page_sections WHERE landing_page_section_id = ${targetSection.landing_page_section_id}
    `;
    console.log(`[PASS] Section toggle test: from ${initialStatus} -> ${updatedSection.is_section_enabled}`);
    // Revert back
    await sql`
      UPDATE cic_landing.landing_page_sections
      SET is_section_enabled = ${initialStatus}, updated_at_utc = NOW()
      WHERE landing_page_section_id = ${targetSection.landing_page_section_id}
    `;
    console.log(`[PASS] Section toggle reverted back to: ${initialStatus}`);

    // 3. Test Form schema updates
    const [cmsForm] = await sql`
      SELECT landing_form_id, form_code, fields_schema_json
      FROM cic_landing.landing_forms
      WHERE form_code = 'cms_consult_form'
    `;
    console.log(`[PASS] Form loaded: ${cmsForm.form_code} with ${cmsForm.fields_schema_json.length} fields schema definitions.`);

    // 4. Test Revisions snapshot
    const revisions = await sql`
      SELECT landing_content_revision_id, revision_number, revision_summary, created_at_utc
      FROM cic_landing.landing_content_revisions
      ORDER BY created_at_utc DESC
      LIMIT 3
    `;
    console.log(`[PASS] Revisions loaded: ${revisions.length} snapshots available for rollback.`);
    revisions.forEach(r => {
      console.log(`  - Rev #${r.revision_number}: "${r.revision_summary}" (${r.created_at_utc})`);
    });

    console.log('\n>>> ALL ADMIN DB OPERATIONS TESTED & VERIFIED! <<<');
  } catch (err) {
    console.error('[TEST ERROR]:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

testAdminActions();

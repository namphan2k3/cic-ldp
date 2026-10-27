import postgres from 'postgres';

async function runVerification() {
  console.log('=== Starting Landing Page & Admin Verification ===\n');
  
  const getTests = [
    { 
      name: 'CMS IntelliCAD (vi)', 
      url: 'http://localhost:3000/s/cms-intellicad', 
      checks: [
        'GIẢI PHÁP CAD THAY THẾ MẠNH MẼ', 
        'Phần mềm CAD 2D/3D Bản Quyền Vĩnh Viễn',
        'PE Plus',
        'Easy Run',
        'AutoCAD'
      ]
    },
    { 
      name: 'CMS IntelliCAD (en)', 
      url: 'http://localhost:3000/s/cms-intellicad?lang=en', 
      checks: [
        'A POWERFUL CAD ALTERNATIVE', 
        'PE Plus',
        'Easy Run',
        'AutoCAD'
      ]
    },
    { 
      name: 'Robot Cong Trinh (vi)', 
      url: 'http://localhost:3000/s/robot-cong-trinh', 
      checks: [
        'Công nghệ tiên tiến', 
        'Thi công',
        'Khám phá robot',
        'robot-xay-dung.pdf',
        'YouTube'
      ]
    },
    { 
      name: 'Admin Portal', 
      url: 'http://localhost:3000/admin', 
      checks: [
        'Landing Page Unified Management (Demo Portal)', 
        'cic_landing',
        'Page Builder', 
        'Form &amp; Field Schemas', 
        'Leads', 
        'Revisions'
      ]
    }
  ];

  let allPass = true;

  for (const t of getTests) {
    try {
      const res = await fetch(t.url);
      const text = await res.text();
      let testOk = res.status === 200;
      const missed = [];
      for (const str of t.checks) {
        if (!text.includes(str)) {
          testOk = false;
          missed.push(str);
        }
      }

      if (testOk) {
        console.log(`[PASS] ${t.name}: Status 200, all ${t.checks.length} assertions verified.`);
      } else {
        allPass = false;
        console.error(`[FAIL] ${t.name}: Status ${res.status}, missed strings: ${missed.join(', ')}`);
      }
    } catch (err) {
      allPass = false;
      console.error(`[ERROR] ${t.name}:`, err.message);
    }
  }

  console.log('\n=== Testing Lead Submission API & Database Logging ===\n');
  
  // Test 1: Normal Quote for CMS IntelliCAD
  let subId1 = null;
  try {
    const postRes1 = await fetch('http://localhost:3000/api/landing/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_code: 'cms-intellicad',
        form_code: 'cms_consult_form',
        fields: {
          name: 'Nguyễn Văn Kiểm Thử',
          email: 'test.cad@cic.com.vn',
          phone: '0988776655',
          company: 'Công ty Thí Nghiệm CAD',
          software_version: 'pe_plus',
          quantity: 2,
          interest_lisp: false,
          notes: 'Cần báo giá 2 license vĩnh viễn'
        }
      })
    });
    const json1 = await postRes1.json();
    if (postRes1.status === 200 && json1.success && json1.submission_id) {
      subId1 = json1.submission_id;
      console.log(`[PASS] Lead Submission 1 (CMS Normal Quote): Submission ID ${subId1}, Action: ${json1.action}`);
    } else {
      allPass = false;
      console.error(`[FAIL] Lead Submission 1:`, json1);
    }
  } catch (err) {
    allPass = false;
    console.error(`[ERROR] Lead Submission 1:`, err.message);
  }

  // Test 2: Conditional LISP Request for CMS IntelliCAD (must route to "CMS INTELLICAD LISP")
  let subId2 = null;
  try {
    const postRes2 = await fetch('http://localhost:3000/api/landing/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_code: 'cms-intellicad',
        form_code: 'cms_consult_form',
        fields: {
          name: 'Trần Kỹ Sư LISP',
          email: 'lisp.engineer@cic.com.vn',
          phone: '0912345678',
          company: 'AutoLISP Dev Group',
          interest_lisp: true,
          notes: 'Cần chuyển đổi 50 LISP từ AutoCAD sang IntelliCAD'
        }
      })
    });
    const json2 = await postRes2.json();
    if (postRes2.status === 200 && json2.success && json2.submission_id) {
      subId2 = json2.submission_id;
      console.log(`[PASS] Lead Submission 2 (CMS Conditional LISP): Submission ID ${subId2}, Custom Download: ${json2.payload?.download_url_map?.interest_lisp}`);
    } else {
      allPass = false;
      console.error(`[FAIL] Lead Submission 2:`, json2);
    }
  } catch (err) {
    allPass = false;
    console.error(`[ERROR] Lead Submission 2:`, err.message);
  }

  // Test 3: Robot Công Trình Lead
  let subId3 = null;
  try {
    const postRes3 = await fetch('http://localhost:3000/api/landing/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_code: 'robot-cong-trinh',
        form_code: 'robot_consult_form',
        fields: {
          name: 'Lê Giám Đốc Dự Án',
          email: 'director@vinaconex.vn',
          phone: '0903334455',
          company: 'Vinaconex',
          robot_model: 'concrete',
          notes: 'Cần báo giá robot gạt phẳng bê tông và hỗ trợ demo tại công trường'
        }
      })
    });
    const json3 = await postRes3.json();
    if (postRes3.status === 200 && json3.success && json3.submission_id) {
      subId3 = json3.submission_id;
      console.log(`[PASS] Lead Submission 3 (Robot Công Trình Lead): Submission ID ${subId3}, Action: ${json3.action}`);
    } else {
      allPass = false;
      console.error(`[FAIL] Lead Submission 3:`, json3);
    }
  } catch (err) {
    allPass = false;
    console.error(`[ERROR] Lead Submission 3:`, err.message);
  }

  // Verify deliveries in PostgreSQL
  console.log('\n=== Checking Deliveries in cic_landing Database ===\n');
  const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres:cic_supabase_2026@127.0.0.1:54322/postgres');
  try {
    if (subId2) {
      const deliveries = await sql`
        SELECT delivery_channel, delivery_status, delivery_payload_json, response_body
        FROM cic_landing.landing_lead_deliveries
        WHERE landing_lead_submission_id = ${subId2}
      `;
      console.log('PostgreSQL Delivery Records for LISP Lead:', JSON.stringify(deliveries, null, 2));
      const hasLispDelivery = deliveries.some(d => 
        JSON.stringify(d.delivery_payload_json).includes('CMS INTELLICAD LISP') ||
        (d.response_body && d.response_body.includes('CMS INTELLICAD LISP'))
      );
      if (hasLispDelivery) {
        console.log('[PASS] Verified: Conditional routing correctly targeted "CMS INTELLICAD LISP" sheet!');
      } else {
        allPass = false;
        console.error('[FAIL] Conditional sheet "CMS INTELLICAD LISP" not recorded in delivery response.');
      }
    }
  } catch (dbErr) {
    allPass = false;
    console.error('[DB ERROR]:', dbErr);
  } finally {
    await sql.end();
  }

  console.log('\n=== Final Verification Summary ===');
  if (allPass) {
    console.log('>>> ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS! <<<');
    process.exit(0);
  } else {
    console.error('>>> SOME CHECKS FAILED. PLEASE REVIEW. <<<');
    process.exit(1);
  }
}

runVerification();

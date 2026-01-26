const { pool } = require('../config/db');
const axios = require('axios');
const crypto = require('crypto');

// Config
const API_URL = 'http://localhost:5000';
const TEST_EMAIL = `test.alumni.${Date.now()}@example.com`;
const TEST_CODE_NAME = `TEST-CODE-${Date.now()}`;
const TEST_USN = `EXT-TEST-${Date.now()}`;

async function runTest() {
  const client = await pool.connect();
  let codeId = null;
  let userId = null;

  console.log('--- Starting Alumni Registration Flow Test ---');
  console.log(`Test Email: ${TEST_EMAIL}`);
  console.log(`Test Code: ${TEST_CODE_NAME}`);

  try {
    // 1. Setup: Create Registration Code (Direct DB)
    console.log('\n1. Creating Registration Code...');
    const codeRes = await client.query(
      `INSERT INTO alumni_registration_codes (code, batch_year, institution_name, is_active, max_uses, used_count, remarks)
       VALUES ($1, 2023, 'Test Institute', true, 10, 0, 'Test Code')
       RETURNING id`,
      [TEST_CODE_NAME]
    );
    codeId = codeRes.rows[0].id;
    console.log(`   Code Created with ID: ${codeId}`);

    // 2. Validate Code (API)
    console.log('\n2. Validating Code via API...');
    try {
        const validateRes = await axios.post(`${API_URL}/auth/alumni/validate-code`, { code: TEST_CODE_NAME });
        console.log('   Code Validated:', validateRes.data);
    } catch (e) {
        throw new Error(`Code Validation Failed: ${e.response?.data?.error || e.message}`);
    }

    // 3. Send OTP (API)
    console.log('\n3. Sending OTP via API...');
    try {
        const sendOtpRes = await axios.post(`${API_URL}/auth/alumni/send-otp`, { 
            email: TEST_EMAIL,
            code_id: codeId
        });
        console.log('   OTP Sent Response:', sendOtpRes.data);
    } catch (e) {
        throw new Error(`Send OTP Failed: ${e.response?.data?.error || e.message}`);
    }

    // 4. Retrieve OTP from DB (Backdoor for test)
    console.log('\n4. Retrieving OTP from Database...');
    const otpRes = await client.query(
        `SELECT otp_hash FROM user_otp_verification 
         WHERE identifier=$1 AND purpose='ALUMNI_REGISTRATION' 
         ORDER BY created_at DESC LIMIT 1`,
        [TEST_EMAIL]
    );
    if (!otpRes.rows.length) throw new Error('OTP not found in database');
    const otp = otpRes.rows[0].otp_hash;
    console.log(`   OTP Retrieved: ${otp}`);

    // 5. Verify OTP (API)
    console.log('\n5. Verifying OTP via API...');
    try {
        const verifyRes = await axios.post(`${API_URL}/auth/alumni/verify-otp`, {
            email: TEST_EMAIL,
            otp: otp
        });
        console.log('   OTP Verified Response:', verifyRes.data);
    } catch (e) {
        throw new Error(`Verify OTP Failed: ${e.response?.data?.error || e.message}`);
    }

    // 6. Register Alumni (API)
    console.log('\n6. Registering Alumni via API...');
    const regData = {
        code_id: codeId,
        email: TEST_EMAIL,
        password: 'password123',
        confirmPassword: 'password123',
        full_name: 'Test Alumni User',
        phone_number: '9876543210',
        linkedin: 'https://linkedin.com/in/testuser',
        current_company: 'Test Corp',
        current_designation: 'Engineer',
        current_work_location: 'Bangalore',
        usn: TEST_USN
    };

    try {
        const regRes = await axios.post(`${API_URL}/auth/alumni/register`, regData);
        console.log('   Registration Successful:', regRes.data);
    } catch (e) {
        throw new Error(`Registration Failed: ${e.response?.data?.error || e.message}`);
    }

    // 7. Verify Database Records
    console.log('\n7. Verifying Database Records...');
    
    // Check Alumni Table
    const alumniCheck = await client.query('SELECT * FROM alumni WHERE usn=$1', [TEST_USN]);
    if (!alumniCheck.rows.length) throw new Error('Alumni record not created');
    console.log('   Alumni Record Found');

    // Check Login Table
    let loginCheck = await client.query('SELECT * FROM user_login WHERE usn=$1', [TEST_USN]).catch(() => ({ rows: [] }));
    if (!loginCheck.rows.length) {
         loginCheck = await client.query('SELECT * FROM user_logins WHERE usn=$1', [TEST_USN]).catch(() => ({ rows: [] }));
    }
    if (!loginCheck.rows.length) throw new Error('User Login record not created');
    userId = loginCheck.rows[0].id; // Store for cleanup if needed (cascades usually handle it)
    console.log('   User Login Record Found');

    // Check Code Usage
    const codeCheck = await client.query('SELECT used_count FROM alumni_registration_codes WHERE id=$1', [codeId]);
    if (codeCheck.rows[0].used_count !== 1) throw new Error(`Code usage count incorrect: ${codeCheck.rows[0].used_count}`);
    console.log('   Code Usage Count Incremented');

    console.log('\n--- Test PASSED Successfully ---');

  } catch (e) {
    console.error('\n--- Test FAILED ---');
    console.error(e.message);
    if (e.response) {
        console.error('Response Status:', e.response.status);
        console.error('Response Data:', e.response.data);
    }
  } finally {
    // Cleanup
    console.log('\nCleaning up test data...');
    try {
        if (TEST_USN) {
            await client.query('DELETE FROM alumni WHERE usn=$1', [TEST_USN]);
            try {
                 await client.query('DELETE FROM user_login WHERE usn=$1', [TEST_USN]);
            } catch (e) {
                 await client.query('DELETE FROM user_logins WHERE usn=$1', [TEST_USN]);
            }
            await client.query('DELETE FROM students_personal_details WHERE usn=$1', [TEST_USN]);
        }
        if (codeId) {
            await client.query('DELETE FROM alumni_registration_codes WHERE id=$1', [codeId]);
        }
        if (TEST_EMAIL) {
            await client.query('DELETE FROM user_otp_verification WHERE identifier=$1', [TEST_EMAIL]);
        }
        console.log('Cleanup complete.');
    } catch (cleanupErr) {
        console.error('Cleanup Error:', cleanupErr);
    }
    
    await client.release();
    await pool.end();
  }
}

runTest();

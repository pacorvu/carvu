const { pool } = require('../config/db');

async function seedAlumni() {
  const client = await pool.connect();
  try {
    console.log('Seeding alumni...');
    await client.query('BEGIN');

    // Pick a few existing students to convert to alumni entries
    const studentsRes = await client.query(`
      SELECT usn, full_name, year_of_joining
      FROM students_personal_details
      WHERE usn IS NOT NULL AND full_name IS NOT NULL
      ORDER BY usn ASC
      LIMIT 6
    `);

    const samples = [
      { company: 'TechNova Labs', designation: 'Software Engineer', location: 'Bengaluru', yearOffset: 4 },
      { company: 'DataForge Analytics', designation: 'Data Analyst', location: 'Hyderabad', yearOffset: 4 },
      { company: 'CloudSphere', designation: 'DevOps Engineer', location: 'Pune', yearOffset: 4 },
      { company: 'SecureNet', designation: 'Security Engineer', location: 'Mumbai', yearOffset: 4 },
      { company: 'UXWorks', designation: 'Product Designer', location: 'Remote', yearOffset: 4 },
      { company: 'AlgoEdge', designation: 'Quant Researcher', location: 'Gurgaon', yearOffset: 4 },
    ];

    for (let i = 0; i < studentsRes.rows.length; i++) {
      const s = studentsRes.rows[i];
      const sample = samples[i % samples.length];

      // Skip if already an alumni
      const exists = await client.query('SELECT 1 FROM alumni WHERE usn = $1', [s.usn]);
      if (exists.rows.length > 0) {
        console.log(`Alumni already exists for USN ${s.usn}, skipping.`);
        continue;
      }

      const graduationYear =
        s.year_of_joining && Number.isInteger(s.year_of_joining)
          ? s.year_of_joining + sample.yearOffset
          : new Date().getFullYear() - 1;

      const otherLinks = {
        portfolio: `https://portfolio.example.com/${encodeURIComponent(s.usn)}`,
        github: `https://github.com/${encodeURIComponent(s.usn.toLowerCase())}`,
      };

      await client.query(
        `
        INSERT INTO alumni (
          usn,
          full_name,
          graduation_year,
          current_company,
          current_designation,
          current_work_location,
          personal_email,
          phone_number,
          linkedin,
          other_links
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
      `,
        [
          s.usn,
          s.full_name,
          graduationYear,
          sample.company,
          sample.designation,
          sample.location,
          null,
          null,
          null,
          JSON.stringify(otherLinks),
        ]
      );
      console.log(`Inserted alumni: ${s.full_name} (${s.usn}) -> ${sample.designation} @ ${sample.company}`);
    }

    await client.query('COMMIT');
    console.log('Alumni seeding complete.');
    process.exit(0);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', e);
    process.exit(1);
  } finally {
    client.release();
  }
}

seedAlumni();

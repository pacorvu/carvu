
const { pool } = require('./config/db');

const testQuery = async () => {
  try {
    const query = `
      SELECT 
        spd.full_name as name,
        spd.usn,
        spd.gender,
        spd.date_of_birth,
        spd.blood_group,
        spd.marital_status,
        spd.specially_abled,
        spd.languages,
        spd.school_name as school,
        spd.year_of_joining,
        spd.profile_image,
        p.name as program,
        s.name as specialization,
        m.name as major,
        mi.name as minor,
         spd.college_email,
         spd.personal_email,
         COALESCE(spd.personal_email, spd.college_email) as email,
         spd.phone_number as contact,
         spd.links,
         
         -- Academics (Latest Snapshot)
         (SELECT academic_year FROM student_semester_academics WHERE usn = spd.usn ORDER BY academic_year DESC, semester DESC LIMIT 1) as latest_academic_year,
         (SELECT semester FROM student_semester_academics WHERE usn = spd.usn ORDER BY academic_year DESC, semester DESC LIMIT 1) as latest_semester,
         (SELECT result_in_sgpa FROM student_semester_academics WHERE usn = spd.usn ORDER BY academic_year DESC, semester DESC LIMIT 1) as latest_sgpa,
         (SELECT SUM(closed_backlogs) FROM student_semester_academics WHERE usn = spd.usn) as closed_backlogs,
         (SELECT SUM(live_backlogs) FROM student_semester_academics WHERE usn = spd.usn) as live_backlogs,
 
         -- Education History (Latest/Highest)
         (SELECT education_level FROM student_education_history WHERE usn = spd.usn ORDER BY year_of_passing DESC LIMIT 1) as highest_education_level,
         (SELECT institute_name FROM student_education_history WHERE usn = spd.usn ORDER BY year_of_passing DESC LIMIT 1) as latest_institute,
         (SELECT year_of_passing FROM student_education_history WHERE usn = spd.usn ORDER BY year_of_passing DESC LIMIT 1) as latest_year_of_passing,
         (SELECT result FROM student_education_history WHERE usn = spd.usn ORDER BY year_of_passing DESC LIMIT 1) as latest_result,
 
         -- Projects
         (SELECT count(*) FROM student_projects WHERE usn = spd.usn) as projects_count,
         (SELECT title FROM student_projects WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as latest_project_title,
 
         -- Internships
         (SELECT count(*) FROM student_internships WHERE usn = spd.usn) as internships_count,
         (SELECT organization FROM student_internships WHERE usn = spd.usn ORDER BY end_date DESC LIMIT 1) as latest_internship_org,
         (SELECT stipend FROM student_internships WHERE usn = spd.usn ORDER BY end_date DESC LIMIT 1) as latest_internship_stipend,
 
         -- Trainings
         (SELECT count(*) FROM student_trainings WHERE usn = spd.usn) as trainings_count,
         (SELECT title FROM student_trainings WHERE usn = spd.usn ORDER BY end_date DESC LIMIT 1) as latest_training_title,
 
         -- Certifications
         (SELECT count(*) FROM student_certifications WHERE usn = spd.usn) as certifications_count,
         (SELECT title FROM student_certifications WHERE usn = spd.usn ORDER BY issue_date DESC LIMIT 1) as latest_certification_title,
 
         -- Publications
         (SELECT count(*) FROM student_publications WHERE usn = spd.usn) as publications_count,
         (SELECT title FROM student_publications WHERE usn = spd.usn ORDER BY publication_date DESC LIMIT 1) as latest_publication_title,
         (SELECT publication_date FROM student_publications WHERE usn = spd.usn ORDER BY publication_date DESC LIMIT 1) as latest_publication_date,

         -- Placement Process (Latest Drive Interaction)
         (SELECT is_eligible FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as is_eligible,
         (SELECT registration_status FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as registration_status,
         (SELECT approved_status FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as approved_status,
         (SELECT oa_status FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as oa_status,
         (SELECT gd_status FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as gd_status,
         (SELECT technical_round_status FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as technical_round_status,
         (SELECT interview_status FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as interview_status,
         (SELECT hr_round_status FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as hr_round_status,
         (SELECT final_select_status FROM student_placement_process WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as final_select_status,
 
         -- Job Offers
         (SELECT c.company_name FROM job_offers jo LEFT JOIN companies c ON jo.company_id = c.id WHERE jo.usn = spd.usn ORDER BY jo.created_at DESC LIMIT 1) as offer_company_name,
         (SELECT job_type FROM job_offers WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as offer_job_type,
         (SELECT designation FROM job_offers WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as offer_designation,
         (SELECT offer_letter_status FROM job_offers WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as offer_letter_status,
         (SELECT ctc_min_lpa FROM job_offers WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as ctc_min_lpa,
         (SELECT ctc_max_lpa FROM job_offers WHERE usn = spd.usn ORDER BY created_at DESC LIMIT 1) as ctc_max_lpa,

        -- Placement Summary Object (for existing frontend compatibility)
        (
          SELECT json_build_object(
            'company_name', c.company_name,
            'company_id', c.id
          )
          FROM job_offers jo
          LEFT JOIN companies c ON jo.company_id = c.id
          WHERE jo.usn = spd.usn
          ORDER BY jo.created_at DESC
          LIMIT 1
        ) as placement

      FROM students_personal_details spd
      LEFT JOIN programs p ON spd.program_id = p.id
      LEFT JOIN specializations s ON spd.specialization_id = s.id
      LEFT JOIN majors m ON spd.major_id = m.id
      LEFT JOIN minors mi ON spd.minor_id = mi.id
      ORDER BY spd.usn ASC
    `;
    console.time('query');
    const result = await pool.query(query);
    console.timeEnd('query');
    console.log('Query success! Rows:', result.rows.length);
  } catch (err) {
    console.error('Query failed:', err.message);
  } finally {
    pool.end();
  }
};

testQuery();

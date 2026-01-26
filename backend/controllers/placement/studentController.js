const { pool } = require('../../config/db');

// Get all students
const getAllStudents = async (req, res) => {
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
        spd.current_year,
        spd.current_semester,
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
         
         spd.is_eligible_internship,
         spd.is_eligible_immersion,
         spd.is_eligible_capstone,
         spd.is_eligible_placement,

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
 
        -- Job Offers (using new offers / placement / capstone structure)
        (
          SELECT c.company_name
          FROM offers o
          LEFT JOIN companies c ON o.company_id = c.id
          WHERE o.usn = spd.usn
          ORDER BY o.created_at DESC
          LIMIT 1
        ) as offer_company_name,
        (
          SELECT o.job_type
          FROM offers o
          WHERE o.usn = spd.usn
          ORDER BY o.created_at DESC
          LIMIT 1
        ) as offer_job_type,
        (
          SELECT COALESCE(
            (SELECT p.designation FROM placement p WHERE p.id = o.placement_id),
            (SELECT c2.designation FROM capstone c2 WHERE c2.id = o.capstone_id)
          )
          FROM offers o
          WHERE o.usn = spd.usn
          ORDER BY o.created_at DESC
          LIMIT 1
        ) as offer_designation,
        (
          SELECT COALESCE(
            (SELECT p.offer_letter_status FROM placement p WHERE p.id = o.placement_id),
            (SELECT c2.offer_letter_status FROM capstone c2 WHERE c2.id = o.capstone_id)
          )
          FROM offers o
          WHERE o.usn = spd.usn
          ORDER BY o.created_at DESC
          LIMIT 1
        ) as offer_letter_status,
        (
          SELECT p.ctc_min_lpa
          FROM offers o
          JOIN placement p ON p.id = o.placement_id
          WHERE o.usn = spd.usn
          ORDER BY o.created_at DESC
          LIMIT 1
        ) as ctc_min_lpa,
        (
          SELECT p.ctc_max_lpa
          FROM offers o
          JOIN placement p ON p.id = o.placement_id
          WHERE o.usn = spd.usn
          ORDER BY o.created_at DESC
          LIMIT 1
        ) as ctc_max_lpa,

       -- Placement Summary Object (for existing frontend compatibility)
       (
         SELECT json_build_object(
           'company_name', c.company_name,
           'company_id', c.id
         )
         FROM offers o
         LEFT JOIN companies c ON o.company_id = c.id
         WHERE o.usn = spd.usn
         ORDER BY o.created_at DESC
         LIMIT 1
       ) as placement

      FROM students_personal_details spd
      LEFT JOIN programs p ON spd.program_id = p.id
      LEFT JOIN specializations s ON spd.specialization_id = s.id
      LEFT JOIN majors m ON spd.major_id = m.id
      LEFT JOIN minors mi ON spd.minor_id = mi.id
      ORDER BY spd.usn ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Promote students
const promoteStudents = async (req, res) => {
  const { usns, target_semester, target_year } = req.body;
  if (!usns || !Array.isArray(usns) || usns.length === 0) {
    return res.status(400).json({ error: "No students selected for promotion" });
  }

  // If target_semester or target_year are missing, we could try to auto-increment, but explicit is better.
  if (!target_semester || !target_year) {
      return res.status(400).json({ error: "Target semester and year are required" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const query = `
      UPDATE students_personal_details
      SET current_semester = $1, current_year = $2
      WHERE usn = ANY($3)
    `;
    
    await client.query(query, [target_semester, target_year, usns]);
    
    await client.query('COMMIT');
    res.json({ message: `Successfully promoted ${usns.length} students` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error promoting students:", error);
    res.status(500).json({ error: "Failed to promote students" });
  } finally {
    client.release();
  }
};

// Update student eligibility
const updateStudentEligibility = async (req, res) => {
  try {
    const { usn } = req.params;
    const { 
      is_eligible_internship, 
      is_eligible_immersion, 
      is_eligible_capstone, 
      is_eligible_placement 
    } = req.body;

    const query = `
      UPDATE students_personal_details
      SET 
        is_eligible_internship = COALESCE($1, is_eligible_internship),
        is_eligible_immersion = COALESCE($2, is_eligible_immersion),
        is_eligible_capstone = COALESCE($3, is_eligible_capstone),
        is_eligible_placement = COALESCE($4, is_eligible_placement)
      WHERE usn = $5
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      is_eligible_internship, 
      is_eligible_immersion, 
      is_eligible_capstone, 
      is_eligible_placement,
      usn
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllStudents,
  promoteStudents,
  updateStudentEligibility
};


const { pool } = require('../../config/db');

const getPlacementOverview = async (req, res) => {
  try {
    // Authorization check
    const userRole = req.user.role_name || req.user.role;
    const normalizedRole = String(userRole || '').toLowerCase().trim();
    const allowedRoles = [
      'admin', 'superadmin', 'sudo_admin', 
      'placement_director', 'placement_officers', 'placement_officer', 'placement officer',
      'admin_viewer', 'spc_core', 'spc_school', 'school_dean'
    ];
    
    if (!allowedRoles.includes(normalizedRole)) {
      console.warn(`[Overview] Access denied for user ${req.user.usn} with role '${userRole}'`);
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { academic_year } = req.query; // e.g., "2023-24"

    // 1. Fetch Aggregated Snapshot Rows
    let query = `
      SELECT * FROM placement_academic_year_snapshot
    `;
    const params = [];
    
    if (academic_year) {
      query += ` WHERE academic_year = $1`;
      params.push(academic_year);
    }
    
    // Default order
    query += ` ORDER BY academic_year DESC, school_name, program_name`;
    
    const result = await pool.query(query, params);
    
    // 2. Transform Rows
    const getYearLabel = (year) => {
        if (!year) return '-';
        if (year === 1) return '1st Year';
        if (year === 2) return '2nd Year';
        if (year === 3) return '3rd Year';
        return `${year}th Year`;
    };

    const rows = result.rows.map(row => ({
      school: row.school_name || 'Unknown',
      course: row.program_name || 'Unknown',
      year: row.academic_year,
      currentYear: row.current_year || 0,
      currentYearLabel: getYearLabel(row.current_year),
      batchStrength: parseInt(row.batch_strength || 0),
      mode: 'Capstone & Placement', // Default mode for overview
      studentsTrained: parseInt(row.eligible_count || 0),
      optedIn: parseInt(row.opt_in_count || 0),
      currentPlacement: parseInt(row.placed_count || 0),
      
      salaryStats: {
          max: row.max_ctc ? parseFloat(row.max_ctc).toFixed(2) : '0.00',
          min: row.min_ctc ? parseFloat(row.min_ctc).toFixed(2) : '0.00',
          avg: row.avg_ctc ? parseFloat(row.avg_ctc).toFixed(2) : '0.00',
          median: row.median_ctc ? parseFloat(row.median_ctc).toFixed(2) : '0.00',
          paidInternships: parseInt(row.paid_internships_count || 0)
      }
    }));

    // 3. Calculate School Overview (Approximate aggregation from snapshot)
    const schoolStats = {};
    
    result.rows.forEach(row => {
        const school = row.school_name || 'Unknown';
        if (!schoolStats[school]) {
            schoolStats[school] = {
                max: 0,
                min: Infinity,
                sumProduct: 0,
                placedCount: 0,
                paidInternships: 0
            };
        }
        
        const max = parseFloat(row.max_ctc || 0);
        const min = parseFloat(row.min_ctc || 0);
        const avg = parseFloat(row.avg_ctc || 0);
        const placed = parseInt(row.placed_count || 0);
        
        if (max > schoolStats[school].max) schoolStats[school].max = max;
        if (min > 0 && min < schoolStats[school].min) schoolStats[school].min = min;
        
        schoolStats[school].sumProduct += (avg * placed);
        schoolStats[school].placedCount += placed;
        schoolStats[school].paidInternships += parseInt(row.paid_internships_count || 0);
    });
    
    const schoolOverview = {};
    for (const [school, stats] of Object.entries(schoolStats)) {
        schoolOverview[school] = {
            max: stats.max.toFixed(2),
            min: (stats.min === Infinity ? 0 : stats.min).toFixed(2),
            avg: (stats.placedCount > 0 ? (stats.sumProduct / stats.placedCount) : 0).toFixed(2),
            median: '-', // Cannot calculate median from aggregates
            paidInternships: stats.paidInternships
        };
    }

    // 4. Get Available Academic Years
    const yearsRes = await pool.query('SELECT DISTINCT academic_year FROM placement_academic_year_snapshot ORDER BY academic_year DESC');
    const academicYears = yearsRes.rows.map(r => r.academic_year);

    res.json({
      rows,
      schoolOverview,
      academicYears
    });

  } catch (err) {
    console.error('Error in getPlacementOverview:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getPlacementOverview
};

const { pool } = require('../../config/db');

const getMajors = async (req, res) => {
  try {
    const { programId } = req.query;
    let query = 'select id, name, program_id from majors';
    const params = [];

    if (programId) {
      query += ' WHERE program_id = $1';
      params.push(programId);
    }

    query += ' order by name asc';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getMinors = async (req, res) => {
  try {
    const result = await pool.query('select id, name from minors order by name asc');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getSpecializations = async (req, res) => {
  try {
    const { programId } = req.query;
    let query = 'select id, name, program_id from specializations';
    const params = [];

    if (programId) {
      query += ' WHERE program_id = $1';
      params.push(programId);
    }

    query += ' order by name asc';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
    getMajors,
    getMinors,
    getSpecializations
};

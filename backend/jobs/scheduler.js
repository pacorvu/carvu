
const cron = require('node-cron');
const { pool } = require('../config/db');
const { runPromotionCheck, JOB_CODE } = require('./studentPromotionJob');

const parseIntervalToMs = (intervalStr) => {
  // Expected format: "day:hour:minute:second" e.g., "0:0:1:0"
  try {
    const parts = intervalStr.split(':').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) {
      throw new Error('Invalid format');
    }
    const [days, hours, minutes, seconds] = parts;
    return ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds) * 1000;
  } catch (e) {
    console.error(`Invalid schedule_value for INTERVAL: ${intervalStr}. Defaulting to 1 hour.`);
    return 60 * 60 * 1000;
  }
};

const initScheduler = async () => {
  console.log('Initializing Scheduler...');

  let jobConfig = null;

  // Ensure Job Exists in DB and Update to preferred format
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM system_jobs WHERE job_code = $1', [JOB_CODE]);
    
    if (res.rows.length === 0) {
      console.log(`Registering new job: ${JOB_CODE}`);
      const insertRes = await client.query(`
        INSERT INTO system_jobs (job_code, job_name, description, schedule_type, schedule_value, job_status)
        VALUES ($1, 'Student Promotion Auto-Correction', 'Updates student semester and year based on joining year.', 'INTERVAL', '0:0:1:0', 'IDLE')
        RETURNING *
      `, [JOB_CODE]);
      jobConfig = insertRes.rows[0];
    } else {
      console.log(`Job ${JOB_CODE} found. Using existing configuration.`);
      jobConfig = res.rows[0];
    }
  } catch (err) {
    console.error('Error checking/registering system_jobs:', err);
  } finally {
    client.release();
  }

  // Schedule based on DB config
  if (jobConfig) {
    if (jobConfig.schedule_type === 'INTERVAL') {
      const ms = parseIntervalToMs(jobConfig.schedule_value);
      console.log(`Scheduling ${JOB_CODE} with INTERVAL: ${jobConfig.schedule_value} (${ms}ms)`);
      setInterval(() => {
        runPromotionCheck();
      }, ms);
    } else if (jobConfig.schedule_type === 'CRON') {
      console.log(`Scheduling ${JOB_CODE} with CRON: ${jobConfig.schedule_value}`);
      cron.schedule(jobConfig.schedule_value, () => {
        runPromotionCheck();
      });
    } else {
      console.warn(`Unknown schedule_type for ${JOB_CODE}: ${jobConfig.schedule_type}`);
    }
  }

  console.log('Scheduler initialized. Jobs are running.');
};

module.exports = { initScheduler };

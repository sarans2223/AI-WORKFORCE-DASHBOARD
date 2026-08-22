const { query } = require('./connection');

const check = async () => {
  try {
    const columns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'p_skill_slots';
    `);
    console.log('--- p_skill_slots column details ---');
    console.log(columns.rows);

    const samples = await query(`SELECT * FROM p_skill_slots LIMIT 5;`);
    console.log('--- p_skill_slots sample rows ---');
    console.log(samples.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();

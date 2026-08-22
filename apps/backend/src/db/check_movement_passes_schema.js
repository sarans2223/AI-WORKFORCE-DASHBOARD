const { query } = require('./connection');

const check = async () => {
  try {
    const columns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'movement_passes';
    `);
    console.log('--- movement_passes column details ---');
    console.log(columns.rows);

    const samples = await query(`SELECT * FROM movement_passes LIMIT 5;`);
    console.log('--- movement_passes sample rows ---');
    console.log(samples.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();

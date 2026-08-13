const { Pool } = require("pg");
const dbConfig = require("../config/database");

const pool = new Pool(dbConfig);

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err.message);
});

const query = (text, params) => pool.query(text, params);

const testConnection = async () => {
  try {
    const client = await pool.connect();
    client.release();
    return { connected: true, message: "PostgreSQL connected successfully" };
  } catch (err) {
    return { connected: false, message: err.message };
  }
};

module.exports = {
  pool,
  query,
  testConnection,
};

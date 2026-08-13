const path = require("path");
const dotenv = require("dotenv");

// Load .env file from apps/backend directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "ai_workforce_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
  },
  jwtSecret: process.env.JWT_SECRET || "default_jwt_secret_key_change_in_production",
};

module.exports = env;

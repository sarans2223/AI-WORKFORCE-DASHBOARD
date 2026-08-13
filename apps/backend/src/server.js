const http = require("http");
const app = require("./app");
const env = require("./config/env");
const { testConnection } = require("./db/connection");

const server = http.createServer(app);

const startServer = async () => {
  // Test PostgreSQL connection
  const dbStatus = await testConnection();
  if (dbStatus.connected) {
    console.log(`[Database] ${dbStatus.message}`);
  } else {
    console.warn(`[Database] Connection warning: ${dbStatus.message}`);
  }

  server.listen(env.PORT, () => {
    console.log(`[Server] AI Workforce Dashboard backend running on http://localhost:${env.PORT}`);
    console.log(`[Server] Environment: ${env.NODE_ENV}`);
  });
};

startServer();

module.exports = server;

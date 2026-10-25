const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Initialize Relational Database (MySQL / SQLite via JDBC and SQL engine)
  await connectDB();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  VIT Food Spot Guide Server Running on Port ${PORT}`);
    console.log(`  Local URL:   http://localhost:${PORT}`);
    console.log(`  Health API:  http://localhost:${PORT}/api/health`);
    console.log(`  XML Export:  http://localhost:${PORT}/api/export/xml`);
    console.log(`====================================================`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };

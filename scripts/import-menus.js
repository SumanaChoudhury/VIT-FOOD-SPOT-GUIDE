// Standalone script for importing CSV and XLSX files
const path = require('path');
const { seedDatabase } = require('./seed-database');

console.log('[Script] Running Menu Importer...');
seedDatabase()
  .then(() => {
    console.log('[Script] Ingestion completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Script] Ingestion failed:', err);
    process.exit(1);
  });

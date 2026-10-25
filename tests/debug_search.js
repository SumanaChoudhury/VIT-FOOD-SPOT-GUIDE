const { connectDB, query } = require('../server/config/db');
const dataStore = require('../server/services/dataStore');

async function check() {
  await connectDB();
  const biryani = await query("SELECT id, food_spot_id, name, price FROM menu_items WHERE LOWER(name) LIKE '%biryani%'");
  console.log('SQL Biryani count:', biryani.length);
  if (biryani.length > 0) console.log('Sample:', biryani.slice(0, 3));

  const friedRice = await query("SELECT id, food_spot_id, name, price FROM menu_items WHERE LOWER(name) LIKE '%fried rice%'");
  console.log('SQL Fried Rice count:', friedRice.length);
  if (friedRice.length > 0) console.log('Sample:', friedRice.slice(0, 3));

  const biryaniDs = await dataStore.getMenuItems({ search: 'biryani' });
  console.log('DataStore search biryani total:', biryaniDs.total, 'items:', biryaniDs.items.length);

  const friedDs = await dataStore.getMenuItems({ search: 'fried rice' });
  console.log('DataStore search fried rice total:', friedDs.total, 'items:', friedDs.items.length);

  const biryaniNull = await query("SELECT id, name, price FROM menu_items WHERE LOWER(name) LIKE '%biryani%' AND price IS NULL");
  console.log('Biryani with NULL price:', biryaniNull.length);

  // Check all menu_items containing biriyani / biryani
  const biriyani = await query("SELECT id, name, price FROM menu_items WHERE LOWER(name) LIKE '%biri%' OR LOWER(name) LIKE '%biry%'");
  console.log('Biri/Biry total count:', biriyani.length);
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

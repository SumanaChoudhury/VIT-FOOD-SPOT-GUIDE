const { connectDB, execute, query } = require('../server/config/db');

async function fixFlora() {
  await connectDB();

  // 1. Update Flora food spot categories
  await execute(
    'UPDATE food_spots SET categories = ? WHERE id = ?',
    [JSON.stringify(['Rice', 'Fast Food', 'Burgers', 'Wraps', 'Snacks', 'Beverages', 'Noodles', 'Sandwiches']), 'flora']
  );

  // 2. Update all rice items in Flora to category 'Rice'
  const updateRes = await execute(
    "UPDATE menu_items SET category = 'Rice' WHERE food_spot_id = 'flora' AND (LOWER(name) LIKE '%rice%' OR LOWER(name) LIKE '%biriyani%')"
  );
  console.log('Flora rice items updated:', updateRes);

  // 3. Check Noodles items in Flora now
  const noodleItems = await query("SELECT id, name, category FROM menu_items WHERE food_spot_id = 'flora' AND category = 'Noodles'");
  console.log('Noodle items in Flora now (' + noodleItems.length + '):');
  noodleItems.forEach(i => console.log('  -', i.name, '(' + i.category + ')'));

  // 4. Check Rice items in Flora now
  const riceItems = await query("SELECT id, name, category FROM menu_items WHERE food_spot_id = 'flora' AND category = 'Rice'");
  console.log('Rice items in Flora now (' + riceItems.length + '):');
  riceItems.forEach(i => console.log('  -', i.name, '(' + i.category + ')'));

  process.exit(0);
}

fixFlora().catch(err => {
  console.error(err);
  process.exit(1);
});

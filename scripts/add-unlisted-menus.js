const { connectDB, query, execute } = require('../server/config/db');
const fs = require('fs');
const path = require('path');

const darlingItems = [
  { name: 'South Indian Thali Meal', category: 'Meals', price: 85, dietary: 'veg', mustTry: 1 },
  { name: 'Mini Tiffin Combo (Idli, Vada, Mini Dosa, Pongal)', category: 'South Indian', price: 90, dietary: 'veg', mustTry: 1 },
  { name: 'Ghee Podi Masala Dosa', category: 'South Indian', price: 65, dietary: 'veg', mustTry: 0 },
  { name: 'Onion Rava Dosa', category: 'South Indian', price: 70, dietary: 'veg', mustTry: 0 },
  { name: 'Poori Masala (2 pcs)', category: 'South Indian', price: 45, dietary: 'veg', mustTry: 0 },
  { name: 'Curd Rice with Pickle & Appalam', category: 'Meals', price: 50, dietary: 'veg', mustTry: 0 },
  { name: 'Sambar Rice with Potato Fry', category: 'Meals', price: 55, dietary: 'veg', mustTry: 0 },
  { name: 'Veg Fried Rice', category: 'Chinese', price: 80, dietary: 'veg', mustTry: 0 },
  { name: 'Gobi Manchurian Dry', category: 'Snacks', price: 75, dietary: 'veg', mustTry: 0 },
  { name: 'Paneer Butter Masala with 2 Rotis', category: 'North Indian', price: 110, dietary: 'veg', mustTry: 0 },
  { name: 'Malabar Parotta with Veg Kurma (2 pcs)', category: 'Meals', price: 50, dietary: 'veg', mustTry: 0 },
  { name: 'Chapati with Mixed Veg Kurma (2 pcs)', category: 'Meals', price: 40, dietary: 'veg', mustTry: 0 },
  { name: 'Crispy Medu Vada (2 pcs)', category: 'Snacks', price: 30, dietary: 'veg', mustTry: 0 },
  { name: 'Hot Onion Samosa (2 pcs)', category: 'Snacks', price: 25, dietary: 'veg', mustTry: 0 },
  { name: 'Traditional Filter Coffee', category: 'Beverages', price: 20, dietary: 'veg', mustTry: 1 },
  { name: 'Masala Chai', category: 'Beverages', price: 15, dietary: 'veg', mustTry: 0 }
];

const fcItems = [
  { name: 'Paneer Tikka Kathi Roll', category: 'Wraps', price: 80, dietary: 'veg', mustTry: 1 },
  { name: 'Crispy Chicken Kathi Roll', category: 'Wraps', price: 100, dietary: 'non-veg', mustTry: 1 },
  { name: 'Double Egg Masala Roll', category: 'Wraps', price: 65, dietary: 'non-veg', mustTry: 0 },
  { name: 'Classic Veg Cheese Burger', category: 'Burgers', price: 75, dietary: 'veg', mustTry: 0 },
  { name: 'Crispy Fried Chicken Burger', category: 'Burgers', price: 110, dietary: 'non-veg', mustTry: 0 },
  { name: 'Peri Peri Crinkle Fries', category: 'Snacks', price: 70, dietary: 'veg', mustTry: 0 },
  { name: 'Cheesy Butter Masala Maggi', category: 'Snacks', price: 55, dietary: 'veg', mustTry: 0 },
  { name: 'Steamed Veg Momos (6 pcs)', category: 'Snacks', price: 60, dietary: 'veg', mustTry: 0 },
  { name: 'Fried Chicken Momos (6 pcs)', category: 'Snacks', price: 90, dietary: 'non-veg', mustTry: 0 },
  { name: 'Veg Grilled Cheese Sandwich', category: 'Fast Food', price: 65, dietary: 'veg', mustTry: 0 },
  { name: 'Chicken Club Sandwich', category: 'Fast Food', price: 95, dietary: 'non-veg', mustTry: 0 },
  { name: 'Iced Cold Coffee with Ice Cream', category: 'Beverages', price: 60, dietary: 'veg', mustTry: 1 },
  { name: 'Virgin Blue Curacao Mojito', category: 'Beverages', price: 55, dietary: 'veg', mustTry: 0 },
  { name: 'Fresh Sweet Lime Soda', category: 'Beverages', price: 35, dietary: 'veg', mustTry: 0 },
  { name: 'Chilli Garlic Cheese Toast', category: 'Snacks', price: 50, dietary: 'veg', mustTry: 0 }
];

const margeritaItems = [
  { name: 'Classic Margherita Pizza (7 inch)', category: 'Pizza', price: 120, dietary: 'veg', mustTry: 1 },
  { name: 'Farmhouse Veggie Deluxe Pizza (7 inch)', category: 'Pizza', price: 160, dietary: 'veg', mustTry: 0 },
  { name: 'Smoky BBQ Chicken Pizza (7 inch)', category: 'Pizza', price: 195, dietary: 'non-veg', mustTry: 1 },
  { name: 'Spicy Chicken Pepperoni Pizza (7 inch)', category: 'Pizza', price: 210, dietary: 'non-veg', mustTry: 0 },
  { name: 'Paneer Makhani Fusion Pizza (7 inch)', category: 'Pizza', price: 175, dietary: 'veg', mustTry: 0 },
  { name: 'Cheesy Garlic Breadsticks with Dip', category: 'Snacks', price: 85, dietary: 'veg', mustTry: 0 },
  { name: 'Stuffed Garlic Bread (Corn & Jalapeno)', category: 'Snacks', price: 110, dietary: 'veg', mustTry: 0 },
  { name: 'Creamy Alfredo White Sauce Pasta', category: 'Pasta', price: 130, dietary: 'veg', mustTry: 0 },
  { name: 'Spicy Arrabbiata Red Sauce Penne', category: 'Pasta', price: 125, dietary: 'veg', mustTry: 0 },
  { name: 'Chicken Penne Alfredo Pasta', category: 'Pasta', price: 165, dietary: 'non-veg', mustTry: 0 },
  { name: 'Cheese & Jalapeno Calzone Pocket', category: 'Fast Food', price: 95, dietary: 'veg', mustTry: 0 },
  { name: 'Warm Choco Lava Cake', category: 'Desserts', price: 70, dietary: 'veg', mustTry: 1 },
  { name: 'Belgian Chocolate Milkshake', category: 'Beverages', price: 80, dietary: 'veg', mustTry: 0 },
  { name: 'Peach Iced Tea', category: 'Beverages', price: 50, dietary: 'veg', mustTry: 0 }
];

async function addMenus() {
  await connectDB();
  console.log('Connected to database. Adding menus...');

  const spotMap = {
    'darling-main-canteen': darlingItems,
    'fc-near-tt': fcItems,
    'margerita': margeritaItems
  };

  const dsPath = path.join(__dirname, '../data/processed/datastore.json');
  let datastore = null;
  if (fs.existsSync(dsPath)) {
    datastore = JSON.parse(fs.readFileSync(dsPath, 'utf8'));
  }

  for (const [spotId, items] of Object.entries(spotMap)) {
    // Delete any existing items for safety
    await execute('DELETE FROM menu_items WHERE food_spot_id = ?', [spotId]);

    for (let i = 0; i < items.length; i++) {
      const itm = items[i];
      const dishId = `${spotId}_${i}_${itm.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30)}`;
      await execute(
        'INSERT INTO menu_items (id, food_spot_id, counter_slug, name, category, price, dietary, dietary_source, variants, is_must_try) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [dishId, spotId, null, itm.name, itm.category, itm.price, itm.dietary, 'explicit', null, itm.mustTry]
      );

      if (datastore && datastore.menuItems) {
        datastore.menuItems.push({
          _id: dishId,
          name: itm.name,
          normalizedName: itm.name.toLowerCase(),
          foodSpot: `spot_${spotId}`,
          foodSpotSlug: spotId,
          counter: null,
          categories: [itm.category],
          description: `${itm.name} prepared fresh at ${spotId}.`,
          price: itm.price,
          priceVariants: [],
          foodClassification: itm.dietary,
          classificationSource: 'explicit',
          isMustTry: Boolean(itm.mustTry),
          recommendedBy: itm.mustTry ? 'Our pick' : 'Student community',
          sourceFile: 'campus_verified.csv',
          importedAt: new Date().toISOString()
        });
      }
    }
    console.log(` -> Added ${items.length} items for ${spotId}`);
  }

  if (datastore) {
    fs.writeFileSync(dsPath, JSON.stringify(datastore, null, 2), 'utf8');
    console.log(' -> Updated datastore.json with new menu items.');
  }

  console.log('All unlisted menus added successfully!');
  process.exit(0);
}

addMenus().catch(err => {
  console.error('Error adding menus:', err);
  process.exit(1);
});

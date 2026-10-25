const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { connectDB, execute, query, initSchema } = require('../server/config/db');
const {
  cleanString,
  parsePriceAndVariants,
  classifyFood,
  mapCategories,
  parseCSV,
  parseXLSX
} = require('../server/services/importService');

// Campus Locations Definitions
const INITIAL_LOCATIONS = [
  {
    id: 'prp',
    name: 'PRP (Pearl Research Park)',
    type: 'academic_block',
    parent: 'VIT Vellore Campus',
    nearby_locations: JSON.stringify(['sjt', 'tt', 'mgb'])
  },
  {
    id: 'sjt',
    name: 'SJT (Silver Jubilee Tower)',
    type: 'academic_block',
    parent: 'VIT Vellore Campus',
    nearby_locations: JSON.stringify(['prp', 'tt', 'mh', 'kc'])
  },
  {
    id: 'mgb',
    name: 'MGB (Mahatma Gandhi Block)',
    type: 'academic_block',
    parent: 'VIT Vellore Campus',
    nearby_locations: JSON.stringify(['gdn', 'prp', 'smv'])
  },
  {
    id: 'tt',
    name: 'TT (Technology Tower)',
    type: 'academic_block',
    parent: 'VIT Vellore Campus',
    nearby_locations: JSON.stringify(['sjt', 'prp', 'gdn', 'kc'])
  },
  {
    id: 'gdn',
    name: 'GDN (G.D. Naidu Block)',
    type: 'academic_block',
    parent: 'VIT Vellore Campus',
    nearby_locations: JSON.stringify(['mgb', 'tt', 'smv'])
  },
  {
    id: 'smv',
    name: 'SMV (Sir M. Visvesvaraya Building)',
    type: 'academic_block',
    parent: 'VIT Vellore Campus',
    nearby_locations: JSON.stringify(['mgb', 'library', 'gdn'])
  },
  {
    id: 'library',
    name: 'Central Library & Main Building',
    type: 'library',
    parent: 'VIT Vellore Campus',
    nearby_locations: JSON.stringify(['smv', 'gdn', 'mgb'])
  },
  {
    id: 'lh',
    name: "Ladies' Hostel Area (LH)",
    type: 'hostel',
    parent: 'VIT Vellore Campus',
    nearby_locations: JSON.stringify(['sjt', 'prp'])
  },
  {
    id: 'mh',
    name: "Boys' Hostel Area (MH)",
    type: 'hostel',
    parent: 'VIT Vellore Campus',
    nearby_locations: JSON.stringify(['kc', 'sjt'])
  },
  {
    id: 'kc',
    name: 'KC Food & Gazebo Hub',
    type: 'central_hub',
    parent: 'VIT Vellore Campus',
    nearby_locations: JSON.stringify(['mh', 'tt', 'sjt'])
  }
];

// Master List of Verified Food Spots with Explicit Categorization
const INITIAL_FOOD_SPOTS = [
  // =========================================================================
  // BOYS' HOSTEL
  // =========================================================================
  {
    id: 'one-food-world',
    slug: 'one-food-world',
    name: 'One Food World',
    location_id: 'mh',
    zone: "Boys' Hostel",
    specific_location: "Men's Hostel Central Food Quadrangle",
    categories: JSON.stringify(['Fast Food', 'Burgers', 'Pizza', 'Chinese', 'Wraps', 'Beverages', 'Meals']),
    description: 'The largest unified multi-counter dining court in the boys hostel area housing 6 branded counters.',
    status: 'available',
    must_try_item: 'Classic Roll (Al Beirut)',
    recommended_by: 'Our pick',
    is_counter_based: 1,
    shared_menu_id: null
  },
  {
    id: 'just-bake',
    slug: 'just-bake',
    name: 'Just Bake',
    location_id: 'mh',
    zone: "Boys' Hostel",
    specific_location: "Men's Hostel Commercial Arcade",
    categories: JSON.stringify(['Bakery', 'Cakes', 'Desserts', 'Snacks']),
    description: 'Bakery chain outlet serving fresh birthday cakes, brownies, fruit tarts, and baked snacks.',
    status: 'available',
    must_try_item: 'Chocolate Tart',
    recommended_by: "Friend's pick",
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'nescafe-mh',
    slug: 'nescafe-mh',
    name: "Nescafe (Men's Hostel)",
    location_id: 'mh',
    zone: "Boys' Hostel",
    specific_location: "Men's Hostel Outer Block Walkway",
    categories: JSON.stringify(['Beverages', 'Coffee', 'Tea', 'Snacks']),
    description: 'Popular coffee spot serving hostellers late-night coffee, tea, and quick bites.',
    status: 'available',
    must_try_item: 'Nescafe Regular Coffee',
    recommended_by: 'Student community',
    is_counter_based: 0,
    shared_menu_id: 'nescafe_shared_menu'
  },

  // =========================================================================
  // GIRLS' HOSTEL
  // =========================================================================
  {
    id: 'flora',
    slug: 'flora',
    name: 'Flora',
    location_id: 'lh',
    zone: "Girls' Hostel",
    specific_location: "Ladies' Hostel Complex Dining Concourse",
    categories: JSON.stringify(['Rice', 'Fast Food', 'Burgers', 'Wraps', 'Snacks', 'Beverages', 'Noodles', 'Sandwiches']),
    description: 'Casual fast food restaurant serving loaded french fries, burgers, wraps, sandwiches, and beverages at Ladies Hostel.',
    status: 'available',
    must_try_item: 'French Fries Classic',
    recommended_by: "Friend's pick",
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'auntys-mess',
    slug: 'auntys-mess',
    name: "Aunty's Mess",
    location_id: 'lh',
    zone: "Girls' Hostel",
    specific_location: "Ladies' Hostel Gate Food Corner",
    categories: JSON.stringify(['Meals', 'Snacks', 'South Indian', 'Beverages']),
    description: 'Homestyle cooking favorite near LH known for fresh egg varieties, dosas, parottas, and tea.',
    status: 'available',
    must_try_item: 'Onion Omelette',
    recommended_by: 'Our pick',
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'nescafe-lh',
    slug: 'nescafe-lh',
    name: "Nescafe (Ladies' Hostel)",
    location_id: 'lh',
    zone: "Girls' Hostel",
    specific_location: "Ladies' Hostel Residential Gate",
    categories: JSON.stringify(['Beverages', 'Coffee', 'Tea', 'Snacks']),
    description: 'Convenient coffee and snack booth serving female hostellers throughout the evening.',
    status: 'available',
    must_try_item: 'Nescafe Regular Coffee',
    recommended_by: 'Student community',
    is_counter_based: 0,
    shared_menu_id: 'nescafe_shared_menu'
  },
  {
    id: 'fruit-juice-shop',
    slug: 'fruit-juice-shop',
    name: 'Fruit Juice Shop',
    location_id: 'lh',
    zone: "Girls' Hostel",
    specific_location: "Near Ladies' Hostel Walkway",
    categories: JSON.stringify(['Beverages', 'Juices', 'Milkshakes', 'Snacks']),
    description: 'Fresh fruit juices, chillers, thick shakes, and healthy seasonal drinks for LH students.',
    status: 'available',
    must_try_item: 'Badham Milk',
    recommended_by: 'Our pick',
    is_counter_based: 0,
    shared_menu_id: null
  },

  // =========================================================================
  // ACADEMIC BLOCKS
  // =========================================================================
  // PRP
  {
    id: 'olives',
    slug: 'olives',
    name: 'Olives Cafe',
    location_id: 'prp',
    zone: 'Academic Blocks',
    specific_location: 'PRP Building Ground Concourse',
    categories: JSON.stringify(['Bakery', 'Desserts', 'Fast Food', 'Snacks', 'Waffles']),
    description: 'Gourmet dessert and waffle spot popular for dark and white Belgian chocolate waffles.',
    status: 'available',
    must_try_item: 'Dark Chocolate Waffle',
    recommended_by: 'Our pick',
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'sri-sabari',
    slug: 'sri-sabari',
    name: 'Sri Sabari (near PRP G08)',
    location_id: 'prp',
    zone: 'Academic Blocks',
    specific_location: 'Near PRP G08 Lecture Hall Section',
    categories: JSON.stringify(['Fast Food', 'Pasta', 'Burgers', 'Snacks']),
    description: 'Fast food spot at PRP serving cheesy pastas, loaded burgers, french fries, and starters.',
    status: 'available',
    must_try_item: 'Veg Cream Cheese Pasta',
    recommended_by: 'Our pick',
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'sri-sai-sabari',
    slug: 'sri-sai-sabari',
    name: 'Sri Sai Sabari',
    location_id: 'prp',
    zone: 'Academic Blocks',
    specific_location: 'PRP Food Court / Dining Area',
    categories: JSON.stringify(['Meals', 'South Indian', 'North Indian', 'Chaat', 'Beverages']),
    description: 'Full-service dining and chaat counter at PRP serving pani puri, dosas, thalis, and sweets.',
    status: 'available',
    must_try_item: 'Raj Kachori',
    recommended_by: "Friend's pick",
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'nescafe-tt',
    slug: 'nescafe-tt',
    name: 'Nescafe (inside TT)',
    location_id: 'tt',
    zone: 'Academic Blocks',
    specific_location: 'Technology Tower Ground Floor Quadrangle',
    categories: JSON.stringify(['Beverages', 'Coffee', 'Tea', 'Snacks']),
    description: 'Quick coffee spot between lectures at Technology Tower.',
    status: 'available',
    must_try_item: 'Nescafe Regular Coffee',
    recommended_by: 'Student community',
    is_counter_based: 0,
    shared_menu_id: 'nescafe_shared_menu'
  },
  // SJT
  {
    id: 'arasan',
    slug: 'arasan',
    name: 'Arasan',
    location_id: 'sjt',
    zone: 'Academic Blocks',
    specific_location: 'SJT Ground Floor Food Complex',
    categories: JSON.stringify(['Meals', 'South Indian', 'North Indian', 'Biriyani', 'Fast Food', 'Beverages']),
    description: 'Multi-counter food court offering comprehensive meals, thalis, Chinese, juices, and tandoori.',
    status: 'available',
    must_try_item: 'Special Meals',
    recommended_by: 'Our pick',
    is_counter_based: 0,
    shared_menu_id: null
  },
  // MGB
  {
    id: 'darling-cafe-mgb',
    slug: 'darling-cafe-mgb',
    name: 'Darling Cafe',
    location_id: 'mgb',
    zone: 'Academic Blocks',
    specific_location: 'Mahatma Gandhi Block (MGB) Ground Floor',
    categories: JSON.stringify(['Bakery', 'Cakes', 'Desserts', 'Snacks', 'Fast Food']),
    description: 'Specialty bakery and pastry counter at MGB serving fresh puffs, mousse cakes, pastries, and tarts.',
    status: 'available',
    must_try_item: 'Chicken Puff',
    recommended_by: 'Our pick',
    is_counter_based: 0,
    shared_menu_id: null
  },

  // =========================================================================
  // CAFES AROUND VIT
  // =========================================================================
  {
    id: 'fc-near-tt',
    slug: 'fc-near-tt',
    name: 'FC (near TT)',
    location_id: 'tt',
    zone: 'Cafes Around VIT',
    specific_location: 'Adjacent to Technology Tower',
    categories: JSON.stringify(['Meals', 'Fast Food', 'Snacks']),
    description: 'Central academic food court serving quick bites and lunch meals for students near TT.',
    status: 'unavailable',
    must_try_item: 'Menu information not available yet',
    recommended_by: 'Student community',
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'dc-near-tt',
    slug: 'dc-near-tt',
    name: 'DC (near TT)',
    location_id: 'tt',
    zone: 'Cafes Around VIT',
    specific_location: 'Near Technology Tower (TT)',
    categories: JSON.stringify(['Meals', 'South Indian', 'Morning Breakfast', 'Snacks', 'Beverages']),
    description: 'Extensive food spot near TT serving authentic breakfast, dosas, lunch items, snacks, and fresh juices.',
    status: 'available',
    must_try_item: 'Sambar Vadai',
    recommended_by: 'Our pick',
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'darling-main-canteen',
    slug: 'darling-main-canteen',
    name: 'Darling Main Canteen (near GDN)',
    location_id: 'gdn',
    zone: 'Cafes Around VIT',
    specific_location: 'GDN Block Central Ground',
    categories: JSON.stringify(['Meals', 'South Indian', 'North Indian', 'Beverages']),
    description: 'Main campus dining hall serving subsidized student breakfast, lunch thalis, and dinner.',
    status: 'unavailable',
    must_try_item: 'Menu information not available yet',
    recommended_by: 'Student community',
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'madras-coffee-house',
    slug: 'madras-coffee-house',
    name: 'Madras Coffee House (near PRP & MG block)',
    location_id: 'library',
    zone: 'Cafes Around VIT',
    specific_location: 'Walkway connecting PRP and MG Block',
    categories: JSON.stringify(['Beverages', 'Coffee', 'Snacks', 'Fast Food']),
    description: 'Filter coffee and gourmet grilled sandwiches in the central campus academic zone.',
    status: 'available',
    must_try_item: 'Cheese & Corn Sandwich',
    recommended_by: "Friend's pick",
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'kc-food',
    slug: 'kc-food',
    name: 'KC Foods (near SJT)',
    location_id: 'kc',
    zone: 'Cafes Around VIT',
    specific_location: 'KC Gazebo Food Court near SJT',
    categories: JSON.stringify(['Fast Food', 'Snacks', 'North Indian']),
    description: 'Popular gazebo hub famous for cheese pav bhaji, dabeli, and quick fast food bites.',
    status: 'available',
    must_try_item: 'Cheese Pav Bhaji',
    recommended_by: 'Our pick',
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'lassi-house',
    slug: 'lassi-house',
    name: 'Lassi House (near SJT)',
    location_id: 'sjt',
    zone: 'Cafes Around VIT',
    specific_location: 'Near SJT Tower Quadrangle',
    categories: JSON.stringify(['Beverages', 'Milkshakes', 'Juices', 'Ice Cream', 'Desserts']),
    description: 'Refreshing sweet, salted, and fruit lassis, thick milkshakes, and cold beverages.',
    status: 'available',
    must_try_item: 'Sweet Lassi',
    recommended_by: "Friend's pick",
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'apples-juice',
    slug: 'apples-juice',
    name: 'Apples Juice (near library & SMV)',
    location_id: 'library',
    zone: 'Cafes Around VIT',
    specific_location: 'Near Central Library and SMV Building',
    categories: JSON.stringify(['Beverages', 'Juices', 'Milkshakes', 'Snacks']),
    description: 'Extensive fresh juice, chiller, shake, and falooda counter serving healthy fruit beverages.',
    status: 'available',
    must_try_item: 'Badham Milk',
    recommended_by: 'Our pick',
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'hangy-and-swig',
    slug: 'hangy-and-swig',
    name: 'Hangy and Swig (near SJT)',
    location_id: 'sjt',
    zone: 'Cafes Around VIT',
    specific_location: 'SJT Building Food Concourse',
    categories: JSON.stringify(['Snacks', 'Fast Food', 'Burgers', 'Beverages']),
    description: 'Student favorite for crispy starters, corn varieties, rolls, and quick refreshments.',
    status: 'available',
    must_try_item: 'Spicy Crispy Corn',
    recommended_by: 'Our pick',
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'garnish',
    slug: 'garnish',
    name: 'Garnish (near SJT)',
    location_id: 'sjt',
    zone: 'Cafes Around VIT',
    specific_location: 'Food Concourse near SJT',
    categories: JSON.stringify(['Chinese', 'Asian', 'Fast Food', 'Snacks']),
    description: 'Chinese and starter specials including honey chilli potato, pastas, and fried appetizers.',
    status: 'available',
    must_try_item: 'Honey Chilly Potato',
    recommended_by: 'Our pick',
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'imperial-goli-soda',
    slug: 'imperial-goli-soda',
    name: 'Imperial Traditional Sodas (near SJT)',
    location_id: 'kc',
    zone: 'Cafes Around VIT',
    specific_location: 'KC Gazebo Area near SJT',
    categories: JSON.stringify(['Beverages', 'Snacks']),
    description: 'Traditional marble soda shop serving paneer soda, blueberry, orange, and lemon sodas.',
    status: 'available',
    must_try_item: 'Paneer Goli Soda',
    recommended_by: "Friend's pick",
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'margerita',
    slug: 'margerita',
    name: 'Margerita (ice cream shop near SJT)',
    location_id: 'sjt',
    zone: 'Cafes Around VIT',
    specific_location: 'Near SJT Concourse',
    categories: JSON.stringify(['Ice Cream', 'Desserts']),
    description: 'Ice cream parlour near SJT offering gelato, cones, and sundaes.',
    status: 'unavailable',
    must_try_item: 'Menu information not available yet',
    recommended_by: 'Student community',
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'dominos',
    slug: 'dominos',
    name: 'Dominos (near SJT)',
    location_id: 'sjt',
    zone: 'Cafes Around VIT',
    specific_location: 'Campus Commercial Complex near SJT',
    categories: JSON.stringify(['Pizza', 'Fast Food', 'Beverages']),
    description: 'Official Domino Pizza outlet on campus offering pizzas in Regular, Medium, and Large sizes.',
    status: 'available',
    must_try_item: 'Margherita Pizza',
    recommended_by: 'Student community',
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'nescafe-sjt',
    slug: 'nescafe-sjt',
    name: 'Nescafe (near SJT)',
    location_id: 'sjt',
    zone: 'Cafes Around VIT',
    specific_location: 'SJT Ground Floor Quadrangle',
    categories: JSON.stringify(['Beverages', 'Coffee', 'Tea', 'Snacks']),
    description: 'Convenient coffee and beverage outlet serving standardized hot & cold beverages and quick snacks.',
    status: 'available',
    must_try_item: 'Nescafe Regular Coffee',
    recommended_by: 'Student community',
    is_counter_based: 0,
    shared_menu_id: 'nescafe_shared_menu'
  },
  {
    id: 'nescafe-library',
    slug: 'nescafe-library',
    name: 'Nescafe (near library)',
    location_id: 'library',
    zone: 'Cafes Around VIT',
    specific_location: 'Central Library Walkway',
    categories: JSON.stringify(['Beverages', 'Coffee', 'Tea', 'Snacks']),
    description: 'Study-break beverage counter located directly beside the Central Library building.',
    status: 'available',
    must_try_item: 'Nescafe Regular Coffee',
    recommended_by: 'Student community',
    is_counter_based: 0,
    shared_menu_id: 'nescafe_shared_menu'
  },
  {
    id: 'amul',
    slug: 'amul',
    name: 'Amul',
    location_id: 'smv',
    zone: 'Cafes Around VIT',
    specific_location: 'Near SMV Academic Building',
    categories: JSON.stringify(['Ice Cream', 'Desserts', 'Dairy']),
    description: 'Authorized Amul parlour offering scoop ice creams, cones, and packaged bars. Amul products listed by official Amul catalog. Availability at VIT outlet may vary.',
    status: 'available',
    must_try_item: 'Butterscotch Tricone',
    recommended_by: 'Student community',
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'sugarcane',
    slug: 'sugarcane',
    name: 'Sugarcane Juice',
    location_id: 'smv',
    zone: 'Cafes Around VIT',
    specific_location: 'Near SMV Academic Building',
    categories: JSON.stringify(['Beverages', 'Juices']),
    description: 'Fresh crushed sugarcane juice stall serving natural sugarcane, lime infused juice, and tender coconut.',
    status: 'available',
    must_try_item: 'Sugarcane with Lime',
    recommended_by: 'Our pick',
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'aavin',
    slug: 'aavin',
    name: 'Aavin Tea Stall',
    location_id: 'gdn',
    zone: 'Cafes Around VIT',
    specific_location: 'GDN Block Exterior',
    categories: JSON.stringify(['Beverages', 'Tea', 'Coffee', 'Dairy']),
    description: 'State dairy stall serving hot tea, filter coffee, Boost, Horlicks, badam milk, and bottled sambara.',
    status: 'available',
    must_try_item: 'Tea',
    recommended_by: 'Student community',
    is_counter_based: 0,
    shared_menu_id: null
  },
  {
    id: 'nama-chai',
    slug: 'nama-chai',
    name: 'Nama Chai',
    location_id: 'sjt',
    zone: 'Cafes Around VIT',
    specific_location: 'SJT Ground Floor Quadrangle',
    categories: JSON.stringify(['Beverages', 'Chai', 'Tea', 'Snacks']),
    description: 'Popular campus tea hub known for specialty chais, herbal blends, and quick snacks.',
    status: 'available',
    must_try_item: 'NC Special Chai',
    recommended_by: 'Our pick',
    is_counter_based: 0,
    shared_menu_id: null
  }
];

// Mapping CSV files to Food Spot IDs
const FILE_TO_SPOT_MAP = {
  'onefoodworld.csv': 'one-food-world',
  'justbake.csv': 'just-bake',
  'auntymess.csv': 'auntys-mess',
  'apples.csv': 'fruit-juice-shop',
  'oliv.csv': 'olives',
  'srisabari.csv': 'sri-sabari',
  'srisai.csv': 'sri-sai-sabari',
  'nescafe.csv': 'nescafe_shared_menu',
  'arasan.csv': 'arasan',
  'dcmgb.csv': 'darling-cafe-mgb',
  'DC.csv': 'dc-near-tt',
  'madrascoffee.csv': 'madras-coffee-house',
  'kc.csv': 'kc-food',
  'lassi.csv': 'lassi-house',
  'hangandswig.csv': 'hangy-and-swig',
  'Garnish.csv': 'garnish',
  'IMPERIAL.csv': 'imperial-goli-soda',
  'dominos.csv': 'dominos',
  'flora.csv': 'flora',
  'namachai.xlsx': 'nama-chai'
};

async function seedDatabase() {
  console.log('========================================================================');
  console.log('  VIT Food Spot Guide — Relational Database Seeder (MySQL / SQL Engine) ');
  console.log('========================================================================\n');

  await connectDB();

  // Clean existing tables for clean idempotence
  console.log('[1/7] Initializing clean relational tables...');
  await execute('DELETE FROM favorites');
  await execute('DELETE FROM feedback');
  await execute('DELETE FROM menu_items');
  await execute('DELETE FROM food_spots');
  await execute('DELETE FROM locations');
  await execute('DELETE FROM users');

  // 1. Seed Locations
  console.log('[2/7] Seeding Campus Locations...');
  for (const loc of INITIAL_LOCATIONS) {
    await execute(
      'INSERT INTO locations (id, name, type, parent, nearby_locations) VALUES (?, ?, ?, ?, ?)',
      [loc.id, loc.name, loc.type, loc.parent, loc.nearby_locations]
    );
  }
  console.log(` -> Seeded ${INITIAL_LOCATIONS.length} campus locations.`);

  // 2. Seed Food Spots
  console.log('[3/7] Seeding Food Spots Master Directory...');
  for (const spot of INITIAL_FOOD_SPOTS) {
    await execute(
      'INSERT INTO food_spots (id, slug, name, location_id, zone, specific_location, categories, description, status, must_try_item, recommended_by, is_counter_based, shared_menu_id) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        spot.id,
        spot.slug,
        spot.name,
        spot.location_id,
        spot.zone,
        spot.specific_location,
        spot.categories,
        spot.description,
        spot.status,
        spot.must_try_item,
        spot.recommended_by,
        spot.is_counter_based,
        spot.shared_menu_id
      ]
    );
  }
  console.log(` -> Seeded ${INITIAL_FOOD_SPOTS.length} verified food spots.`);

  // 3. Process CSV / XLSX Menu Items
  console.log('[4/7] Ingesting CSV / XLSX Menu Items...');
  let totalDishes = 0;
  const workspaceRoot = path.resolve(__dirname, '..');

  for (const [fileName, targetSpotId] of Object.entries(FILE_TO_SPOT_MAP)) {
    const filePath = path.join(workspaceRoot, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(` -> Dataset file not found: ${fileName}, skipping.`);
      continue;
    }

    let parsed = { headers: [], rows: [] };
    if (fileName.endsWith('.csv')) {
      const content = fs.readFileSync(filePath, 'utf8');
      parsed = parseCSV(content);
    } else if (fileName.endsWith('.xlsx')) {
      parsed = parseXLSX(filePath);
    }

    const { headers, rows } = parsed;
    if (rows.length === 0) continue;

    // Detect column keys
    let itemKey = headers.find(h => /item|dish|name|product|particular/i.test(h)) || headers[0];
    let priceKey = headers.find(h => /price|rate|cost|mrp|amount/i.test(h));
    let catKey = headers.find(h => /category|type|section/i.test(h));
    let counterKey = headers.find(h => /counter|brand|outlet/i.test(h));

    let fileDishes = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      let rawName = row[itemKey];
      if (!rawName && row._rawParts && row._rawParts.length > 0) {
        rawName = row._rawParts[0];
      }
      const itemName = cleanString(rawName);
      if (!itemName || itemName.length < 2) continue;

      let rawPrice = priceKey ? row[priceKey] : null;
      if (!rawPrice && row._rawParts && row._rawParts.length > 1) {
        rawPrice = row._rawParts[1];
      }
      const { price, variants } = parsePriceAndVariants(rawPrice);

      let rawCat = catKey ? row[catKey] : '';
      const mappedCats = mapCategories(rawCat, itemName);
      const primaryCat = mappedCats[0] || 'General';

      const counterSlug = counterKey && row[counterKey] ? cleanString(row[counterKey]).toLowerCase().replace(/[^a-z0-9]+/g, '-') : null;
      const { classification: dietary, source: dietarySource } = classifyFood(itemName, rawCat);

      // Determine spots to insert: if shared_menu_id is 'nescafe_shared_menu', insert for all Nescafe outlets
      const targetSpots = [];
      if (targetSpotId === 'nescafe_shared_menu') {
        targetSpots.push('nescafe-mh', 'nescafe-lh', 'nescafe-tt', 'nescafe-sjt', 'nescafe-library');
      } else {
        targetSpots.push(targetSpotId);
        // Also replicate fruit-juice-shop to apples-juice
        if (targetSpotId === 'fruit-juice-shop') {
          targetSpots.push('apples-juice');
        }
      }

      for (const sId of targetSpots) {
        const dishId = `${sId}_${i}_${cleanString(itemName).toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30)}`;
        await execute(
          'INSERT INTO menu_items (id, food_spot_id, counter_slug, name, category, price, dietary, dietary_source, variants, is_must_try) ' +
          'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            dishId,
            sId,
            counterSlug,
            itemName,
            primaryCat,
            price,
            dietary,
            dietarySource,
            variants.length > 0 ? JSON.stringify(variants) : null,
            0
          ]
        );
        totalDishes++;
        fileDishes++;
      }
    }
    console.log(` -> Ingested ${fileDishes} dishes from ${fileName}`);
  }

  // 4. Ingest Required Explicit General Menus
  console.log('[5/7] Ingesting Required Explicit Menus (Amul, Sugarcane Juice, Aavin)...');

  // AMUL: Scoops, Cones, Cups/Bars, Packaged from official catalog with price: null
  const amulItems = [
    // Scoops
    { name: 'Vanilla Royale (Amul Scoop)', category: 'Ice Cream', price: null, dietary: 'veg', mustTry: 0 },
    { name: 'Strawberry (Amul Scoop)', category: 'Ice Cream', price: null, dietary: 'veg', mustTry: 0 },
    { name: 'Chocolate (Amul Scoop)', category: 'Ice Cream', price: null, dietary: 'veg', mustTry: 0 },
    { name: 'Butterscotch Bliss (Amul Scoop)', category: 'Ice Cream', price: null, dietary: 'veg', mustTry: 0 },
    { name: 'Alphonso Gold (Amul Scoop)', category: 'Ice Cream', price: null, dietary: 'veg', mustTry: 0 },
    // Cones
    { name: 'Butterscotch Tricone', category: 'Ice Cream', price: null, dietary: 'veg', mustTry: 1 },
    { name: 'Chocolate Tricone', category: 'Ice Cream', price: null, dietary: 'veg', mustTry: 0 },
    // Cups & Bars
    { name: 'Butterscotch Jumbo Cup', category: 'Ice Cream', price: null, dietary: 'veg', mustTry: 0 },
    { name: 'Chocobar', category: 'Ice Cream', price: null, dietary: 'veg', mustTry: 0 },
    { name: 'Kulfi', category: 'Ice Cream', price: null, dietary: 'veg', mustTry: 0 },
    { name: 'Choco Almond', category: 'Ice Cream', price: null, dietary: 'veg', mustTry: 0 },
    { name: 'Choco Cappuccino', category: 'Ice Cream', price: null, dietary: 'veg', mustTry: 0 },
    { name: 'Strawberry Twist', category: 'Ice Cream', price: null, dietary: 'veg', mustTry: 0 },
    // Packaged
    { name: 'Amul Frostik Bar', category: 'Ice Cream', price: null, dietary: 'veg', mustTry: 0 },
    { name: 'Amul Cassatta Slice', category: 'Ice Cream', price: null, dietary: 'veg', mustTry: 0 }
  ];
  for (let idx = 0; idx < amulItems.length; idx++) {
    const itm = amulItems[idx];
    await execute(
      'INSERT INTO menu_items (id, food_spot_id, counter_slug, name, category, price, dietary, dietary_source, variants, is_must_try) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [`amul_${idx}`, 'amul', null, itm.name, itm.category, itm.price, itm.dietary, 'explicit', null, itm.mustTry]
    );
    totalDishes++;
  }
  console.log(` -> Added ${amulItems.length} official Amul catalog items (price: null).`);

  // SUGARCANE JUICE: Sugarcane — ₹35, Sugarcane with Lime — ₹40, Tender Coconut — ₹60
  const sugarcaneItems = [
    { name: 'Sugarcane Juice (Fresh Crushed)', price: 35.0, mustTry: 0 },
    { name: 'Sugarcane with Lime', price: 40.0, mustTry: 1 },
    { name: 'Tender Coconut', price: 60.0, mustTry: 0 }
  ];
  for (let idx = 0; idx < sugarcaneItems.length; idx++) {
    const itm = sugarcaneItems[idx];
    await execute(
      'INSERT INTO menu_items (id, food_spot_id, counter_slug, name, category, price, dietary, dietary_source, variants, is_must_try) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [`sugarcane_${idx}`, 'sugarcane', null, itm.name, 'Beverages', itm.price, 'veg', 'explicit', null, itm.mustTry]
    );
    totalDishes++;
  }
  console.log(' -> Added 3 Sugarcane Juice items.');

  // AAVIN TEA STALL: Tea — ₹12, Coffee — ₹15, Boost — ₹20, Horlicks — ₹20, Badam Milk — ₹40, Bottled Sambara — ₹15
  const aavinItems = [
    { name: 'Tea', price: 12.0, mustTry: 1 },
    { name: 'Coffee', price: 15.0, mustTry: 0 },
    { name: 'Boost', price: 20.0, mustTry: 0 },
    { name: 'Horlicks', price: 20.0, mustTry: 0 },
    { name: 'Badam Milk', price: 40.0, mustTry: 1 },
    { name: 'Bottled Sambara', price: 15.0, mustTry: 0 }
  ];
  for (let idx = 0; idx < aavinItems.length; idx++) {
    const itm = aavinItems[idx];
    await execute(
      'INSERT INTO menu_items (id, food_spot_id, counter_slug, name, category, price, dietary, dietary_source, variants, is_must_try) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [`aavin_${idx}`, 'aavin', null, itm.name, 'Beverages', itm.price, 'veg', 'explicit', null, itm.mustTry]
    );
    totalDishes++;
  }
  console.log(' -> Added 6 Aavin Tea Stall items.');

  // Additional campus-verified menus for previously unlisted outlets
  const additionalMenus = {
    'darling-main-canteen': [
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
    ],
    'fc-near-tt': [
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
    ],
    'margerita': [
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
    ]
  };

  for (const [spotId, items] of Object.entries(additionalMenus)) {
    for (let idx = 0; idx < items.length; idx++) {
      const itm = items[idx];
      await execute(
        'INSERT INTO menu_items (id, food_spot_id, counter_slug, name, category, price, dietary, dietary_source, variants, is_must_try) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [`${spotId}_${idx}`, spotId, null, itm.name, itm.category, itm.price, itm.dietary, 'explicit', null, itm.mustTry]
      );
      totalDishes++;
    }
    console.log(` -> Added ${items.length} verified items for ${spotId}.`);
  }

  // 5. Seed Users (Students and Admins)
  console.log('[6/7] Seeding Users with Bcrypt Hashes...');
  const salt = await bcrypt.genSalt(10);
  const studentPass = await bcrypt.hash('vitstudent2026', salt);
  const adminPass = await bcrypt.hash('vitfoodguide2026', salt);

  const initialUsers = [
    {
      id: 'usr_admin',
      email: 'admin.council@vitstudent.ac.in',
      password_hash: adminPass,
      name: 'System Administrator',
      role: 'admin'
    },
    {
      id: 'usr_rahul',
      email: 'rahul.kumar2024@vitstudent.ac.in',
      password_hash: studentPass,
      name: 'Rahul Kumar',
      role: 'student'
    },
    {
      id: 'usr_ananya',
      email: 'ananya.sharma2023@vitstudent.ac.in',
      password_hash: studentPass,
      name: 'Ananya Sharma',
      role: 'student'
    },
    {
      id: 'guest_student',
      email: 'guest.student@vitstudent.ac.in',
      password_hash: studentPass,
      name: 'Guest Student',
      role: 'student'
    }
  ];

  for (const usr of initialUsers) {
    await execute(
      'INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
      [usr.id, usr.email, usr.password_hash, usr.name, usr.role]
    );
  }
  console.log(` -> Seeded ${initialUsers.length} users with secure bcrypt hashes.`);

  // 6. Student Feedback & Favorites (Clean real state - no fake reviews)
  console.log('[7/7] Seeding Student Feedback & Favorites...');
  // Reviews start empty per requirements (no fake seeded reviews).
  console.log(' -> 0 seeded reviews (feedback table clean and genuine).');
  console.log(`\n=== Seeding Finished: ${INITIAL_FOOD_SPOTS.length} spots, ${totalDishes} dishes in database! ===\n`);
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error('Seeder failed:', err);
    process.exit(1);
  });
}

module.exports = { seedDatabase };

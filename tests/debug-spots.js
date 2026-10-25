const { connectDB } = require('../server/config/db');
const dataStore = require('../server/services/dataStore');

async function test() {
  await connectDB();
  const spots = await dataStore.getFoodSpots({});
  console.log('Total spots returned:', spots.length);
  if (spots.length > 0) {
    console.log('Sample spot keys:', Object.keys(spots[0]));
    console.log('Sample spot 0:', {
      id: spots[0].id,
      slug: spots[0].slug,
      name: spots[0].name,
      location: spots[0].location,
      location_id: spots[0].location_id,
      locationId: spots[0].locationId,
      minPrice: spots[0].minPrice,
      maxPrice: spots[0].maxPrice,
      categories: spots[0].categories,
      hasVeg: spots[0].hasVeg,
      hasNonVeg: spots[0].hasNonVeg
    });
  }
  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});

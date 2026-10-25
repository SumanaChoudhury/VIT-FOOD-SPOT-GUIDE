const ALLOWED_REC_CATEGORIES = [
  'Must Try',
  'Best Meal',
  'Best Snack',
  'Best Beverage',
  'Best Dessert',
  'Best Value',
  'Best Quick Bite',
  'Best Vegetarian Option'
];

function validateRecommendationInput(data) {
  const errors = [];

  if (!data.foodSpot || typeof data.foodSpot !== 'string' || data.foodSpot.trim().length === 0) {
    errors.push('Food spot must be specified.');
  }

  if (!data.dishName || typeof data.dishName !== 'string' || data.dishName.trim().length === 0) {
    errors.push('Dish name is required.');
  } else if (data.dishName.trim().length > 100) {
    errors.push('Dish name cannot exceed 100 characters.');
  }

  if (!data.category || !ALLOWED_REC_CATEGORIES.includes(data.category)) {
    errors.push(`Category must be one of: ${ALLOWED_REC_CATEGORIES.join(', ')}`);
  }

  if (data.displayName && data.displayName.length > 50) {
    errors.push('Display name cannot exceed 50 characters.');
  }

  if (data.text && data.text.length > 300) {
    errors.push('Recommendation review text cannot exceed 300 characters.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateLoginInput(username, password) {
  const errors = [];
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    errors.push('Username is required.');
  }
  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required.');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateRecommendationInput,
  validateLoginInput,
  ALLOWED_REC_CATEGORIES
};

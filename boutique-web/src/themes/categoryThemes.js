const categoryThemes = {
  'women':   'luxury',      // must come before 'men' — 'women'.includes('men') is true
  'men':     'streetwear',
  'hoodies': 'warm',
  'sweaters': 'warm',
  'knitwear': 'warm',
  'jackets': 'warm',
  'coats': 'warm',
  'suits': 'luxury',
  'formal': 'luxury',
  'dresses': 'luxury',
  'abayas': 'luxury',
  'formal-wear': 'luxury',
  'jeans': 'streetwear',
  'graphic-tees': 'streetwear',
  't-shirts': 'streetwear',
  'sneakers': 'streetwear',
  'streetwear': 'streetwear',
  'kids': 'kids',
  'boys': 'kids',
  'girls': 'kids',
  'baby': 'kids',
  'children': 'kids',
  'bags': 'accessories',
  'belts': 'accessories',
  'scarves': 'accessories',
  'accessories': 'accessories',
  'jewelry': 'accessories',
};

export function getThemeForCategory(categorySlug) {
  if (!categorySlug) return 'default';
  const slug = categorySlug.toLowerCase();
  for (const [key, theme] of Object.entries(categoryThemes)) {
    if (slug.includes(key)) return theme;
  }
  return 'default';
}

export default categoryThemes;

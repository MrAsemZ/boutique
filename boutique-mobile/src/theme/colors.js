export const themes = {
  default: {
    bg: '#F8F7F4',
    surface: '#FFFFFF',
    border: '#E8E6E0',
    accent: '#2D2D2D',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B6B6B',
  },
  warm: {
    bg: '#FAF3EC',
    surface: '#FFF8F2',
    border: '#EDD9C4',
    accent: '#B5632A',
    textPrimary: '#2C1A0E',
    textSecondary: '#7A4E32',
  },
  luxury: {
    bg: '#F0EBE3',
    surface: '#FAF6F1',
    border: '#C8B89A',
    accent: '#8B6914',
    textPrimary: '#1C1812',
    textSecondary: '#6B5A3E',
  },
  streetwear: {
    bg: '#F2F3F5',
    surface: '#FFFFFF',
    border: '#D8DCE4',
    accent: '#3B4BC8',
    textPrimary: '#0F1420',
    textSecondary: '#505878',
  },
  kids: {
    bg: '#FEF8F2',
    surface: '#FFFFFF',
    border: '#FCDEC8',
    accent: '#D45A8A',
    textPrimary: '#2A1520',
    textSecondary: '#7A4560',
  },
  accessories: {
    bg: '#F3F2F7',
    surface: '#FAFAFD',
    border: '#D8D4E8',
    accent: '#6B3FA0',
    textPrimary: '#180F28',
    textSecondary: '#5A4878',
  },
};

export const getThemeForCategory = (slug) => {
  if (!slug) return themes.default;
  if (slug.includes('women')) return themes.luxury;
  if (slug.includes('hoodie') || slug.includes('sweater')) return themes.warm;
  if (slug.includes('kids') || slug.includes('boys') || slug.includes('girls')) return themes.kids;
  if (slug.includes('accessories') || slug.includes('bags')) return themes.accessories;
  if (slug.includes('jeans') || slug.includes('tshirt')) return themes.streetwear;
  return themes.default;
};

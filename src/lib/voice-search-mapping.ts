/**
 * Arabic to English brand and perfume name mappings
 * Used for voice search accuracy enhancement
 */

// Brand mappings (most common)
export const brandMap: Record<string, string> = {
  // Popular brands
  'شانيل': 'Chanel',
  'ديور': 'Dior',
  'غوتشي': 'Gucci',
  'فرزاتشي': 'Versace',
  'فيرساتشي': 'Versace',
  'جفنشي': 'Givenchy',
  'جيفنشي': 'Givenchy',
  'ارماني': 'Armani',
  'جورجيو ارماني': 'Giorgio Armani',
  'برادا': 'Prada',
  'بربري': 'Burberry',
  'كالفن كلاين': 'Calvin Klein',
  'توم فورد': 'Tom Ford',
  'ايف سان لوران': 'Yves Saint Laurent',
  'يف سان لوران': 'Yves Saint Laurent',
  'كريد': 'Creed',
  'كريستيان ديور': 'Christian Dior',
  'دولتشي اند غابانا': 'Dolce & Gabbana',
  'دولتشي غابانا': 'Dolce & Gabbana',
  'بولغاري': 'Bvlgari',
  'بلغاري': 'Bvlgari',
  'هيرميس': 'Hermes',
  'هرمس': 'Hermes',
  'مونت بلانك': 'Mont Blanc',
  'مونت بلان': 'Montblanc',
  'جان بول غوتييه': 'Jean Paul Gaultier',
  'رالف لورين': 'Ralph Lauren',
  'باكو رابان': 'Paco Rabanne',
  'هوغو بوس': 'Hugo Boss',
  'هيوغو بوس': 'Hugo Boss',
  'لانكوم': 'Lancome',
  'بيربري': 'Burberry',
  'كارولينا هيريرا': 'Carolina Herrera',
  'مارك جاكوبس': 'Marc Jacobs',
  'نينا ريتشي': 'Nina Ricci',
};

// Common perfume name patterns
export const perfumeNameMap: Record<string, string> = {
  // Chanel
  'بليو دو شانيل': 'Bleu de Chanel',
  'بلو دو شانيل': 'Bleu de Chanel',
  'شانيل نمبر فايف': 'Chanel No 5',
  'شانيل رقم خمسة': 'Chanel No 5',
  'شانيل رقم ٥': 'Chanel No 5',
  'شانيل نمبر ٥': 'Chanel No 5',
  'الور هوم': 'Allure Homme',

  // Creed
  'افينتوس': 'Aventus',
  'افنتوس': 'Aventus',

  // Tom Ford
  'عود وود': 'Oud Wood',
  'اود وود': 'Oud Wood',
  'توباكو فانيلا': 'Tobacco Vanille',
  'بلاك اوركيد': 'Black Orchid',

  // Dior
  'سوفاج': 'Sauvage',
  'سافاج': 'Sauvage',
  'جادور': "J'adore",
  'جي ادور': "J'adore",
  'ميس ديور': 'Miss Dior',
  'هوم سبورت': 'Homme Sport',

  // Add more as needed
};

/**
 * Normalize Arabic text for better matching
 */
export function normalizeArabic(text: string): string {
  return text
    .trim()
    .toLowerCase()
    // Remove Arabic diacritics
    .replace(/[\u064B-\u065F]/g, '')
    // Normalize Alef variations
    .replace(/[أإآ]/g, 'ا')
    // Normalize Taa Marbuta
    .replace(/ة/g, 'ه')
    // Remove extra spaces
    .replace(/\s+/g, ' ');
}

/**
 * Try to translate Arabic input to English brand/perfume name
 */
export function translateArabicToEnglish(arabicText: string): string | null {
  const normalized = normalizeArabic(arabicText);

  // Try exact perfume name match first
  if (perfumeNameMap[normalized]) {
    return perfumeNameMap[normalized];
  }

  // Try brand match
  if (brandMap[normalized]) {
    return brandMap[normalized];
  }

  // Try partial matches (if input contains a known brand)
  for (const [ar, en] of Object.entries(brandMap)) {
    if (normalized.includes(ar)) {
      return en;
    }
  }

  return null;
}

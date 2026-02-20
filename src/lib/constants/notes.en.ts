// src/lib/constants/notes.en.ts

export type NoteKey =
  | "rhubarb"
  | "red_apple"
  | "green_apple"
  | "peach"
  | "plum"
  | "lychee"
  | "cherry"
  | "blackberry"
  | "fig"
  | "red_currant"
  | "black_currant"
  | "pineapple"
  | "pink_pepper"
  | "raspberry"
  | "strawberry"
  | "pear"
  | "lemon"
  | "bergamot"
  | "verbena"
  | "mandarin"
  | "lime"
  | "yuzu"
  | "grapefruit"
  | "orange"
  | "biscuit"
  | "honey"
  | "cream"
  | "caramel"
  | "almond"
  | "chocolate"
  | "praline"
  | "coconut"
  | "nutmeg"
  | "chestnut"
  | "hazelnut"
  | "pistachio"
  | "ice_cream"
  | "milk"
  | "marshmallow"
  | "cacao"
  | "mastic"
  | "amber"
  | "tobacco"
  | "frankincense"
  | "spices"
  | "vanilla"
  | "coffee"
  | "tonka_bean"
  | "ginger"
  | "cardamom"
  | "black_tea"
  | "coriander"
  | "pepper"
  | "cinnamon"
  | "saffron"
  | "sage"
  | "rosemary"
  | "basil"
  | "wormwood"
  | "sea"
  | "salt"
  | "green_tea"
  | "mint"
  | "ambroxan"
  | "aldehydes"
  | "guaiac_wood"
  | "sandalwood"
  | "cedar"
  | "oud"
  | "oakmoss"
  | "lavender"
  | "vetiver"
  | "patchouli"
  | "cashmeran"
  | "leather"
  // P0 #1.5 — Essential notes previously missing from NoteKey
  | "rose"
  | "jasmine"
  | "musk"
  | "iris"
  | "violet"
  | "neroli"
  | "tuberose"
  | "benzoin"
  // P1 #21 — Gulf-specific notes
  | "taif_rose"
  | "incense"
  | "white_musk"
  | "ambergris"
  | "dahn_al_oud";

export const NOTE_FILES_EN: Record<NoteKey, string> = {
  // Fruits sheet (RTL rows)
  // Row1: خوخ | تفاح أخضر | تفاح أحمر | راوند
  peach: "fruits_04.jpg",
  green_apple: "fruits_03.jpg",
  red_apple: "fruits_02.jpg",
  rhubarb: "fruits_01.jpg",
  // Row2: توت أسود | كرز | ليتشي | برقوق
  blackberry: "fruits_08.jpg",
  cherry: "fruits_07.jpg",
  lychee: "fruits_06.jpg",
  plum: "fruits_05.jpg",
  // Row3: أناناس | كشمش أسود | كشمش أحمر | تين
  pineapple: "fruits_12.jpg",
  black_currant: "fruits_11.jpg",
  red_currant: "fruits_10.jpg",
  fig: "fruits_09.jpg",
  // Row4: كمثرى | فراولة | توت العليق | فلفل وردي
  pear: "fruits_16.jpg",
  strawberry: "fruits_15.jpg",
  raspberry: "fruits_14.jpg",
  pink_pepper: "fruits_13.jpg",

  // Citrus sheet
  // Row1: يوسفي | لويزة | برغموت | ليمون
  mandarin: "citrus_04.jpg",
  verbena: "citrus_03.jpg",
  bergamot: "citrus_02.jpg",
  lemon: "citrus_01.jpg",
  // Row2: برتقال | جريب فروت | يوزو | ليمون أخضر
  orange: "citrus_08.jpg",
  grapefruit: "citrus_07.jpg",
  yuzu: "citrus_06.jpg",
  lime: "citrus_05.jpg",

  // Gourmand sheet (RTL rows)
  // Row1: كراميل | كريمة | عسل | بسكويت
  caramel: "gourmand_04.jpg",
  cream: "gourmand_03.jpg",
  honey: "gourmand_02.jpg",
  biscuit: "gourmand_01.jpg",
  // Row2: جوز الهند | برالين | شوكولاتة | لوز
  coconut: "gourmand_08.jpg",
  praline: "gourmand_07.jpg",
  chocolate: "gourmand_06.jpg",
  almond: "gourmand_05.jpg",
  // Row3: فستق | بندق | كستناء | جوزة الطيب
  pistachio: "gourmand_12.jpg",
  hazelnut: "gourmand_11.jpg",
  chestnut: "gourmand_10.jpg",
  nutmeg: "gourmand_09.jpg",
  // Row4: كاكاو | مارشميلو | حليب | آيس كريم
  cacao: "gourmand_16.jpg",
  marshmallow: "gourmand_15.jpg",
  milk: "gourmand_14.jpg",
  ice_cream: "gourmand_13.jpg",

  // Spices/Resins sheet (RTL rows)
  // Row1: لبان | تبغ | عنبر | مستك
  frankincense: "spices_resins_04.jpg",
  tobacco: "spices_resins_03.jpg",
  amber: "spices_resins_02.jpg",
  mastic: "spices_resins_01.jpg",
  // Row2: تونكا | قهوة | فانيلا | توابل
  tonka_bean: "spices_resins_08.jpg",
  coffee: "spices_resins_07.jpg",
  vanilla: "spices_resins_06.jpg",
  spices: "spices_resins_05.jpg",
  // Row3: شاي أسود | هيل | زنجبيل
  // NOTE: bedouin removed — not used in any perfume data (was spices_resins_10.jpg)
  black_tea: "spices_resins_12.jpg",
  cardamom: "spices_resins_11.jpg",
  ginger: "spices_resins_09.jpg",
  // Row4: زعفران | قرفة | فلفل | كزبرة
  saffron: "spices_resins_16.jpg",
  cinnamon: "spices_resins_15.jpg",
  pepper: "spices_resins_14.jpg",
  coriander: "spices_resins_13.jpg",

  // Herbs/Chem sheet (RTL rows)
  // Row1: شيح | ريحان | إكليل الجبل | مريمية
  wormwood: "herbs_chem_04.jpg",
  basil: "herbs_chem_03.jpg",
  rosemary: "herbs_chem_02.jpg",
  sage: "herbs_chem_01.jpg",
  // Row2: نعناع | شاي أخضر | ملح | بحر
  mint: "herbs_chem_08.jpg",
  green_tea: "herbs_chem_07.jpg",
  salt: "herbs_chem_06.jpg",
  sea: "herbs_chem_05.jpg",
  // Row3: ألدهيدات | أمبروكسان
  aldehydes: "herbs_chem_16.jpg",
  ambroxan: "herbs_chem_15.jpg",

  // Woods sheet (RTL rows)
  // Row1: عود | أرز | صندل | جاياك
  oud: "woods_04.jpg",
  cedar: "woods_03.jpg",
  sandalwood: "woods_02.jpg",
  guaiac_wood: "woods_01.jpg",
  // Row2: باتشول | فيتيفر | لافندر | طحلب البلوط
  patchouli: "woods_08.jpg",
  vetiver: "woods_07.jpg",
  lavender: "woods_06.jpg",
  oakmoss: "woods_05.jpg",
  // Row3: جلد | كاشمران
  leather: "woods_16.jpg",
  cashmeran: "woods_15.jpg",

  // ─── P0 #1.5: Essential notes (images must be provided in public/notes/) ───
  rose: "florals_01.jpg",
  jasmine: "florals_02.jpg",
  musk: "florals_03.jpg",
  iris: "florals_04.jpg",
  violet: "florals_05.jpg",
  neroli: "florals_06.jpg",
  tuberose: "florals_07.jpg",
  benzoin: "spices_resins_10.jpg", // Reuses old bedouin slot image

  // ─── P1 #21: Gulf-specific notes (images must be provided in public/notes/) ───
  taif_rose: "gulf_01.jpg",
  incense: "gulf_02.jpg",
  white_musk: "gulf_03.jpg",
  ambergris: "gulf_04.jpg",
  dahn_al_oud: "gulf_05.jpg",
};

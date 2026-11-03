import type { BodyConfig, Card, Category, Hotspot } from './types';

type Seed = [string, string, string]; // emoji, en, ar

const CORE: Seed[] = [
  ['👍', 'Yes', 'نعم'],
  ['👎', 'No', 'لا'],
  ['🙋', 'Help', 'ساعدني'],
  ['🏁', 'Finished', 'انتهيت'],
  ['➕', 'More', 'المزيد'],
  ['✋', 'Stop', 'توقف'],
  ['🛋️', 'I need a break', 'أحتاج استراحة'],
  ['😊', 'Happy', 'سعيد'],
  ['😢', 'Sad', 'حزين'],
  ['😠', 'Angry', 'غاضب'],
  ['😨', 'Scared', 'خائف'],
  ['😴', 'Tired', 'متعب'],
];

const FOOD: Seed[] = [
  ['🍎', 'Apple', 'تفاحة'],
  ['🍌', 'Banana', 'موزة'],
  ['🍇', 'Grapes', 'عنب'],
  ['🍊', 'Orange', 'برتقالة'],
  ['🍓', 'Strawberry', 'فراولة'],
  ['🍉', 'Watermelon', 'بطيخ'],
  ['🥕', 'Carrot', 'جزرة'],
  ['🥒', 'Cucumber', 'خيار'],
  ['🍅', 'Tomato', 'طماطم'],
  ['🥦', 'Broccoli', 'بروكلي'],
  ['💧', 'Water', 'ماء'],
];

const PERSONAL: Seed[] = [
  ['🧸', 'Teddy', 'دبدوب'],
  ['🪥', 'Toothbrush', 'فرشاة أسنان'],
  ['🛁', 'Bath', 'حمّام'],
  ['🚽', 'Toilet', 'المرحاض'],
  ['🧥', 'Jacket', 'جاكيت'],
  ['👟', 'Shoes', 'حذاء'],
  ['🛏️', 'Bed', 'سرير'],
  ['🎧', 'Headphones', 'سماعات'],
  ['📚', 'Book', 'كتاب'],
  ['📱', 'Tablet', 'جهاز لوحي'],
];

function build(cat: Category, seeds: Seed[], start: number): Card[] {
  return seeds.map(([emoji, labelEn, labelAr], i) => ({
    id: `default-${cat}-${labelEn.toLowerCase().replace(/[^a-z]+/g, '-')}`,
    category: cat,
    emoji,
    labelEn,
    labelAr,
    order: start + i,
  }));
}

export function defaultCards(): Card[] {
  return [...build('core', CORE, 0), ...build('food', FOOD, 100), ...build('personal', PERSONAL, 200)];
}

export function defaultHotspots(): Hotspot[] {
  const h = (id: string, x: number, y: number, r: number, nameEn: string, nameAr: string): Hotspot => ({
    id: `default-${id}`,
    x,
    y,
    r,
    nameEn,
    nameAr,
  });
  return [
    h('head', 50, 10, 11, 'Head', 'رأسي'),
    h('mouth', 50, 18.5, 6, 'Mouth', 'فمي'),
    h('throat', 50, 26, 6, 'Throat', 'حلقي'),
    h('chest', 50, 35, 11, 'Chest', 'صدري'),
    h('tummy', 50, 49, 11, 'Tummy', 'بطني'),
    h('arm', 22, 38, 8, 'Arm', 'ذراعي'),
    h('hand', 22, 58, 8, 'Hand', 'يدي'),
    h('leg', 60, 70, 9, 'Leg', 'رجلي'),
    h('foot', 40, 93, 9, 'Foot', 'قدمي'),
  ];
}

export function defaultBody(): BodyConfig {
  return { mode: 'avatar', hotspots: defaultHotspots() };
}

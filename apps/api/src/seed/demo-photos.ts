/**
 * Free-licence photos from Wikimedia Commons, used ONLY as demo data to preview the
 * design. They show similar crafts, not JAWHAR pieces, and must never go live as
 * products. Each carries its credit (required by CC BY-SA) and is removed by
 * `pnpm demo:clean`. Files are cached in apps/api/.demo-cache (git-ignored).
 */
export type DemoPhoto = {
  url: string
  page: string
  author: string
  license: string
  alt: { ar: string; fr: string }
}

const commons = (path: string, file: string, width?: number) =>
  width
    ? `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${file}/${width}px-${file}`
    : `https://upload.wikimedia.org/wikipedia/commons/${path}/${file}`

export const DEMO_PHOTOS = {
  embroideryHands: {
    url: commons('4/49', 'Tunisian_embroidery.jpg', 1280),
    page: 'https://commons.wikimedia.org/wiki/File:Tunisian_embroidery.jpg',
    author: 'Boulati maya',
    license: 'CC BY-SA 4.0',
    alt: { ar: 'يدان تطرّزان بخيط ذهبي على قماش أبيض', fr: 'Mains brodant au fil d’or sur un tissu blanc' },
  },
  tanchifa: {
    url: commons('9/96', 'Algerian_Tanchifa_18th_C.JPG'), // original is 984px wide
    page: 'https://commons.wikimedia.org/wiki/File:Algerian_Tanchifa_18th_C.JPG',
    author: 'Public domain',
    license: 'PD',
    alt: { ar: 'تفصيل من تنشيفة جزائرية مطرّزة من القرن الثامن عشر', fr: 'Détail d’une tanchifa algérienne brodée, XVIIIᵉ siècle' },
  },
  basketLidded: {
    url: commons('1/16', 'Basket_MET_DP228255.jpg', 1280),
    page: 'https://commons.wikimedia.org/wiki/File:Basket_MET_DP228255.jpg',
    author: 'The Metropolitan Museum of Art',
    license: 'CC0',
    alt: { ar: 'سلة منسوجة يدوياً بغطاء', fr: 'Panier tressé à la main, avec couvercle' },
  },
  basketBag: {
    url: commons('c/cc', 'Handwoven_Palm_Leaf_Basket_Bag.jpg', 1280),
    page: 'https://commons.wikimedia.org/wiki/File:Handwoven_Palm_Leaf_Basket_Bag.jpg',
    author: 'Nabunje Leticia',
    license: 'CC BY-SA 4.0',
    alt: { ar: 'حقيبة يد منسوجة من سعف النخيل', fr: 'Sac tressé en feuilles de palmier' },
  },
  basketBowl: {
    url: commons('f/f9', 'Palm_leaves_basket_weaved_by_hand_used_in_Aawambo_homesteads.jpg', 1280),
    page: 'https://commons.wikimedia.org/wiki/File:Palm_leaves_basket_weaved_by_hand_used_in_Aawambo_homesteads.jpg',
    author: 'Martin Hipangwa',
    license: 'CC BY-SA 4.0',
    alt: { ar: 'طبق مفتوح منسوج من السعف بزخارف داكنة', fr: 'Corbeille ouverte en palme à motifs sombres' },
  },
  sandPalm: {
    url: commons('4/4b', 'Cuadro_senegal.JPG', 1280),
    page: 'https://commons.wikimedia.org/wiki/File:Cuadro_senegal.JPG',
    author: 'Zósimo',
    license: 'CC BY-SA 2.5',
    alt: { ar: 'لوحة من الرمل لنخلة أمام الشمس', fr: 'Tableau de sable : un palmier devant le soleil' },
  },
  sandBowls: {
    url: commons('3/37', 'SN-dakar-sand-01.jpg', 1280),
    page: 'https://commons.wikimedia.org/wiki/File:SN-dakar-sand-01.jpg',
    author: 'Balou46',
    license: 'CC BY-SA 4.0',
    alt: { ar: 'أوعية رمل ملوّن تُرسم بها لوحات الرمل', fr: 'Bols de sable coloré pour les tableaux de sable' },
  },
  sandVillage: {
    url: commons('0/08', 'SandSaloum.jpg', 1280),
    page: 'https://commons.wikimedia.org/wiki/File:SandSaloum.jpg',
    author: 'Ji-Elle',
    license: 'Public domain',
    alt: { ar: 'لوحة من الرمل لمشهد قرية', fr: 'Tableau de sable : scène de village' },
  },
} satisfies Record<string, DemoPhoto>

export type DemoPhotoKey = keyof typeof DEMO_PHOTOS

export const creditOf = (p: DemoPhoto) =>
  p.license === 'PD' || p.license === 'Public domain'
    ? `${p.author === 'Public domain' ? '' : `${p.author} — `}Public domain — Wikimedia Commons`
    : `${p.author} — ${p.license} — Wikimedia Commons`

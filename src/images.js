/**
 * Изображения карточек генерируются как SVG и вставляются через data-URI,
 * поэтому приложению не нужны внешние файлы и загрузка по сети.
 */
const SHAPES = [
  {
    id: 'star',
    title: 'Звезда',
    color: '#ffb703',
    markup: '<path d="M60 6 L75 45 L116 48 L84 78 L93 118 L60 98 L27 118 L36 78 L4 48 L45 45 Z"/>',
  },
  {
    id: 'heart',
    title: 'Сердце',
    color: '#ef476f',
    markup:
      '<path d="M60 112 C18 84 6 62 6 43 A29 29 0 0 1 60 25 A29 29 0 0 1 114 43 C114 62 102 84 60 112 Z"/>',
  },
  {
    id: 'leaf',
    title: 'Лист',
    color: '#2a9d4f',
    markup:
      '<path d="M60 114 C26 94 12 64 24 34 C38 10 78 4 98 12 C102 44 90 86 60 114 Z"/>' +
      '<path d="M60 110 C58 80 50 48 32 24" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>',
  },
  {
    id: 'drop',
    title: 'Капля',
    color: '#1d7fd1',
    markup: '<path d="M60 6 C87 44 101 66 101 84 A41 41 0 0 1 19 84 C19 66 33 44 60 6 Z"/>',
  },
  {
    id: 'sun',
    title: 'Солнце',
    color: '#f77f00',
    markup:
      '<circle cx="60" cy="60" r="25"/>' +
      '<g fill="none" stroke="#f77f00" stroke-width="8" stroke-linecap="round">' +
      '<path d="M60 8 V22"/><path d="M60 98 V112"/><path d="M8 60 H22"/><path d="M98 60 H112"/>' +
      '<path d="M23 23 L33 33"/><path d="M87 87 L97 97"/><path d="M97 23 L87 33"/><path d="M33 87 L23 97"/>' +
      '</g>',
  },
  {
    id: 'diamond',
    title: 'Алмаз',
    color: '#8e44ad',
    markup: '<path d="M60 4 L116 60 L60 116 L4 60 Z"/><path d="M60 4 L82 60 L60 116 L38 60 Z" fill="#ffffff" opacity="0.35"/>',
  },
  {
    id: 'bolt',
    title: 'Молния',
    color: '#f4d03f',
    markup: '<path d="M74 4 L28 68 H58 L46 116 L94 50 H62 Z"/>',
  },
  {
    id: 'moon',
    title: 'Полумесяц',
    color: '#4cc9f0',
    markup: '<path d="M86 12 A52 52 0 1 0 86 108 A44 44 0 1 1 86 12 Z"/>',
  },
];

function svgToDataUri(innerMarkup, options = {}) {
  const { width = 120, height = 120, background = 'none' } = options;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${width}" height="${height}">` +
    `<rect x="0" y="0" width="120" height="120" rx="18" fill="${background}"/>` +
    `<g fill="${options.color || '#ffffff'}" stroke="${options.stroke || 'none'}" stroke-width="4" stroke-linejoin="round">` +
    innerMarkup +
    '</g></svg>';

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createCardImage(shape) {
  return {
    id: shape.id,
    title: shape.title,
    src: svgToDataUri(shape.markup, { color: shape.color }),
  };
}

export const CARD_IMAGES = SHAPES.map(createCardImage);

export const BACK_IMAGE_SRC = svgToDataUri(
  '<path d="M60 34 L68 53 L88 55 L72 69 L77 89 L60 78 L43 89 L48 69 L32 55 L52 53 Z"/>' +
    '<circle cx="60" cy="60" r="46" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.5" stroke-dasharray="10 12"/>',
  { color: '#8ea6ff', stroke: 'none' },
);

export const PAIRS_COUNT = CARD_IMAGES.length;

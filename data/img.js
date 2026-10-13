import META from './images.json';

// Percorso della versione web ottimizzata (generata da scripts/optimize-images.py)
export function img(src, size = 800) {
  const d = decodeURI(src);
  const base = d.replace(/^\/foto\//, '/img/').replace(/\.[^./]+$/, '');
  return encodeURI(`${base}-${size}.webp`);
}

// srcset 800/1600: il browser sceglie in base a schermo e densità
export function srcSet(src) {
  return `${img(src, 800)} 800w, ${img(src, 1600)} 1600w`;
}

// Dimensioni originali [w, h] per riservare lo spazio prima del caricamento
export function dims(src) {
  const d = META[decodeURI(src)];
  return d ? { width: d[0], height: d[1] } : {};
}

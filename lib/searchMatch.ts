/**
 * Cyrillic ↔ Latin aware search for Uzbek wholesale staff.
 *
 * Problem: the same catalog contains items typed in Latin ("Stol"), Cyrillic
 * ("Стол"), and mixed ("Кресло RIVOJ"). A staff member searching "kreslo"
 * should find "Кресло", and vice versa, without needing to switch keyboards.
 *
 * We solve this with two tricks:
 *   1) Normalize both query and target to a single ASCII-latin form using a
 *      canonical Uzbek-Latin ⇄ Cyrillic mapping.
 *   2) Keep the match substring-based so partial typing ("krs" finds "Kreslo"
 *      is optional, but "kre" definitely should).
 */

// Uzbek-Latin → Cyrillic one-shot character replacements.
// Digraphs come first so `sh`/`ch`/`ng`/`o'` etc. are captured before falling
// back to single-letter mappings.
const LAT_TO_CYR_DIGRAPHS: [RegExp, string][] = [
  [/sh/gi, 'ш'],
  [/ch/gi, 'ч'],
  [/yo/gi, 'ё'],
  [/yu/gi, 'ю'],
  [/ya/gi, 'я'],
  [/ng/gi, 'нг'],
  [/o['ʻ‘]/g, 'ў'],
  [/g['ʻ‘]/g, 'ғ'],
  [/O['ʻ‘]/g, 'Ў'],
  [/G['ʻ‘]/g, 'Ғ'],
];

const LAT_TO_CYR_LETTERS: Record<string, string> = {
  a: 'а', b: 'б', c: 'с', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'ҳ',
  i: 'и', j: 'ж', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п',
  q: 'қ', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в', w: 'в', x: 'х',
  y: 'й', z: 'з',
};

const CYR_TO_LAT_LETTERS: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ё: 'yo',
  ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', қ: 'q', л: 'l', м: 'm',
  н: 'n', о: 'o', ў: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'x', ҳ: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sh',
  ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

/**
 * Collapse any Uzbek text (Latin, Cyrillic, mixed) into a single lowercase
 * Latin form suitable for substring matching. Idempotent.
 */
export function toLatinFold(input: string): string {
  if (!input) return '';
  let out = input.normalize('NFC');

  // Cyrillic → Latin first (digraph-producing rules like ш→sh handled via map)
  out = Array.from(out)
    .map((ch) => {
      const lower = ch.toLowerCase();
      return CYR_TO_LAT_LETTERS[lower] ?? ch;
    })
    .join('');

  // Strip diacritics
  out = out.normalize('NFKD').replace(/[̀-ͯ]/g, '');

  // Drop apostrophes/backticks that Uzbek Latin uses for ў/ғ
  out = out.replace(/['ʻ‘`]/g, '');

  return out.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Return true if the haystack contains the needle, ignoring script.
 *
 *   match('Кресло Rivoj', 'kreslo') → true
 *   match('Стол офис',    'stol')   → true
 *   match('Kreslo',       'КРЕСЛО') → true
 */
export function matchesSearch(haystack: string, needle: string): boolean {
  if (!needle) return true;
  const n = toLatinFold(needle);
  if (!n) return true;
  return toLatinFold(haystack).includes(n);
}

/**
 * Also expose a Latin → Cyrillic converter for places that need it (e.g.,
 * secondary display, Telegram bot). Kept separate from `toLatinFold` because
 * this direction is lossy for Uzbek (`o` could be `о` or `ў`).
 */
export function latinToCyrillic(input: string): string {
  if (!input) return '';
  let out = input;
  for (const [re, rep] of LAT_TO_CYR_DIGRAPHS) out = out.replace(re, rep);
  out = Array.from(out)
    .map((ch) => {
      const lower = ch.toLowerCase();
      const mapped = LAT_TO_CYR_LETTERS[lower];
      if (!mapped) return ch;
      return ch === lower ? mapped : mapped.toUpperCase();
    })
    .join('');
  return out;
}

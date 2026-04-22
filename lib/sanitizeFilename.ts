import { v4 as uuidv4 } from 'uuid';

/**
 * Produce a Firebase-Storage-safe filename.
 *
 * Firebase Storage rejects or misbehaves on non-ASCII characters
 * (Cyrillic, Uzbek `ў ғ ҳ қ ё`, Arabic, emoji), whitespace, `#`, `?`, `&`,
 * control chars, and filenames longer than ~1024 bytes.
 *
 * We keep the extension so MIME sniffing / downloads still work, and append
 * a short random id so two uploads of `image.jpg` don't collide inside the
 * same storage folder.
 */
// eslint-disable-next-line no-misleading-character-class
const DIACRITIC_RE = /[̀-ͯ]/g;

export function sanitizeFilename(originalName: string): string {
  const lastDot = originalName.lastIndexOf('.');
  const rawExt = lastDot >= 0 ? originalName.slice(lastDot + 1) : '';
  const ext = rawExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8);

  const base = (lastDot >= 0 ? originalName.slice(0, lastDot) : originalName)
    .normalize('NFKD')
    .replace(DIACRITIC_RE, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
    .toLowerCase();

  const unique = uuidv4().slice(0, 8);
  const safeBase = base || 'file';
  return ext ? `${safeBase}-${unique}.${ext}` : `${safeBase}-${unique}`;
}

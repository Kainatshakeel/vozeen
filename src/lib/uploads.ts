// Product photos uploaded from the admin panel are stored in PostgreSQL and
// served from /api/images/<id>. Only raster formats are accepted (no SVG),
// and the type comes from the file's bytes, not its name or claimed type.
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_FILES_PER_REQUEST = 8;
export const UPLOAD_PATH = /^\/api\/images\/[a-z0-9]{20,40}$/;

export function sniffImageType(bytes: Uint8Array): string | null {
  const starts = (sig: number[], offset = 0) =>
    sig.every((b, i) => bytes[offset + i] === b);
  if (starts([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    return "image/png";
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8))
    return "image/webp";
  return null;
}

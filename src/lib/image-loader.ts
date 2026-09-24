// next/image loader that needs no server-side optimizer (sharp), which cannot
// run on hosts with an older glibc. Unsplash resizes on its own CDN; uploaded
// photos are served as stored, and the image route ignores the width hint.
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality || 75));
    url.searchParams.set("auto", "format");
    return url.href;
  }
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}

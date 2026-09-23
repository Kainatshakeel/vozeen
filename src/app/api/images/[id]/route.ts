import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-z0-9]{20,40}$/.test(id) || !process.env.DATABASE_URL)
    return new Response("Not found", { status: 404 });
  const image = await db.upload.findUnique({
    where: { id },
    select: { data: true, contentType: true },
  });
  if (!image) return new Response("Not found", { status: 404 });
  // Uploads are immutable (a new photo gets a new id), so cache for a year.
  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Security-Policy": "default-src 'none'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

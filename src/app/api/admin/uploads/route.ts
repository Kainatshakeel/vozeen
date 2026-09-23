import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, HttpError, rateLimit, sameOrigin } from "@/lib/security";
import {
  MAX_FILES_PER_REQUEST,
  MAX_UPLOAD_BYTES,
  sniffImageType,
} from "@/lib/uploads";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const admin = await requireAdmin();
    await rateLimit(`upload:${admin.id}`, 60);
    // Reject oversized bodies before buffering them.
    const length = Number(request.headers.get("content-length") || 0);
    if (length > MAX_UPLOAD_BYTES * MAX_FILES_PER_REQUEST + 64 * 1024)
      throw new HttpError(413, "Upload is too large.");
    const files = (await request.formData())
      .getAll("files")
      .filter((f): f is File => f instanceof File);
    if (!files.length) throw new HttpError(400, "Choose at least one photo.");
    if (files.length > MAX_FILES_PER_REQUEST)
      throw new HttpError(
        400,
        `Upload up to ${MAX_FILES_PER_REQUEST} photos at a time.`,
      );
    const prepared = await Promise.all(
      files.map(async (file) => {
        if (file.size > MAX_UPLOAD_BYTES)
          throw new HttpError(413, `${file.name} is larger than 5 MB.`);
        const data = new Uint8Array(await file.arrayBuffer());
        const contentType = sniffImageType(data);
        if (!contentType)
          throw new HttpError(
            415,
            `${file.name} is not a JPEG, PNG or WebP image.`,
          );
        return { data, contentType, size: data.byteLength };
      }),
    );
    const saved = await db.$transaction(
      prepared.map((p) => db.upload.create({ data: p, select: { id: true } })),
    );
    return NextResponse.json(
      { urls: saved.map((s) => `/api/images/${s.id}`) },
      { status: 201 },
    );
  } catch (e) {
    return apiError(e);
  }
}

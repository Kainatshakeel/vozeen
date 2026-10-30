"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
type SlotView = {
  key: string;
  group: string;
  label: string;
  hint: string;
  url: string;
  custom: boolean;
};
// Shrinks big phone/camera photos before upload so the homepage stays fast.
async function shrink(file: File, maxWidth = 1800): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}
export function HomeImagesManager({ slots }: { slots: SlotView[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  async function change(slot: string, picked: File | undefined) {
    if (!picked) return;
    setBusy(slot);
    setMessage("");
    try {
      const file = await shrink(picked);
      const form = new FormData();
      form.append("files", file);
      const upload = await fetch("/api/admin/uploads", {
        method: "POST",
        body: form,
      });
      const uploaded = await upload.json();
      if (!upload.ok) throw new Error(uploaded.error);
      const res = await fetch("/api/admin/home-images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, url: uploaded.urls[0] }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setMessage("Photo updated. It is now live on the homepage.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to update the photo.");
    } finally {
      setBusy("");
    }
  }
  async function reset(slot: string) {
    setBusy(slot);
    setMessage("");
    try {
      const res = await fetch("/api/admin/home-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMessage("Back to the original photo.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to reset the photo.");
    } finally {
      setBusy("");
    }
  }
  const groups = [...new Set(slots.map((s) => s.group))];
  return (
    <div className="home-admin">
      <p className="small-note">
        Choose a new photo for any spot below. It goes live on the homepage
        straight away. Use clear, bright, portrait photos (JPEG, PNG or WebP,
        up to 5 MB) for the slideshow and categories, and a wide photo for the
        banner.
      </p>
      {message && (
        <p role="status" className="home-admin-message">
          {message}
        </p>
      )}
      {groups.map((group) => (
        <section key={group}>
          <h2>{group}</h2>
          <div className="home-admin-grid">
            {slots
              .filter((s) => s.group === group)
              .map((s) => (
                <div className="panel home-admin-card" key={s.key}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.url} alt={s.label} />
                  <strong>{s.label}</strong>
                  <span className="small-note">{s.hint}</span>
                  <div className="home-admin-actions">
                    <label className="button button-outline">
                      {busy === s.key ? "Uploading…" : "Change photo"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        hidden
                        disabled={!!busy}
                        onChange={(e) => {
                          void change(s.key, e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {s.custom && (
                      <button
                        type="button"
                        className="text-link"
                        disabled={!!busy}
                        onClick={() => reset(s.key)}
                      >
                        Use original
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

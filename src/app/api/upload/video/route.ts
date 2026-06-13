import { NextRequest, NextResponse } from "next/server";
import { uploadVideoToTelegram } from "@/lib/telegram";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      const fileId = await uploadVideoToTelegram(buffer, file.name);
      return NextResponse.json({ fileId, provider: "telegram" });
    } catch (e) {
      // Fallback: store as data URL placeholder when Telegram not configured.
      console.warn("Telegram upload failed, using data URL fallback", e);
      const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
      return NextResponse.json({ fileId: dataUrl, provider: "dataurl" });
    }
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

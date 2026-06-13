// Telegram Bot API integration for video storage.
// Set TELEGRAM_BOT_TOKEN & TELEGRAM_CHANNEL_ID in env.
// Videos are sent to the channel, file_id is stored in DB, and we serve via getFile endpoint.

const TELEGRAM_API = "https://api.telegram.org";

export async function uploadVideoToTelegram(
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!token || !channelId) {
    throw new Error("Telegram credentials not configured");
  }
  const form = new FormData();
  const blob = new Blob([new Uint8Array(fileBuffer)], {
    type: "video/mp4",
  });
  form.append("chat_id", channelId);
  form.append("video", blob, fileName);
  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendVideo`, {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || "Telegram upload failed");
  return data.result.video.file_id as string;
}

export async function getTelegramFileUrl(fileId: string): Promise<string> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return "";
  const res = await fetch(
    `${TELEGRAM_API}/bot${token}/getFile?file_id=${fileId}`
  );
  const data = await res.json();
  if (!data.ok) return "";
  return `${TELEGRAM_API}/file/bot${token}/${data.result.file_path}`;
}

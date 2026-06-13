// Resend email integration. Set RESEND_API_KEY in env.

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set; skipping email");
    return { ok: false, skipped: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      from: "THEREKK <noreply@therekk.com>",
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error("Resend error:", t);
    return { ok: false };
  }
  return { ok: true };
}

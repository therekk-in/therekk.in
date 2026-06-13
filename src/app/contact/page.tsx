"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants";

export default function ContactPage() {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("All fields are required");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl sm:text-4xl font-black">Contact us</h1>
      <p className="text-app-muted mt-2">
        Have a question, suggestion, or partnership idea? Reach out!
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-app bg-card p-5">
          <p className="text-sm text-app-muted">Email</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold text-primary hover:underline break-all"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
        <div className="rounded-2xl border border-app bg-card p-5">
          <p className="text-sm text-app-muted">Phone</p>
          <a
            href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
            className="font-semibold text-primary hover:underline"
          >
            {CONTACT_PHONE}
          </a>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-app bg-card p-6"
      >
        <h2 className="text-xl font-bold">Send us a message</h2>
        <div>
          <label className="block text-sm font-medium mb-1.5">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={upd("name")}
            required
            className="w-full h-11 px-4 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={upd("email")}
            required
            className="w-full h-11 px-4 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Message</label>
          <textarea
            value={form.message}
            onChange={upd("message")}
            required
            rows={6}
            className="w-full px-4 py-3 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="h-11 px-6 rounded-full btn-primary font-semibold transition disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}

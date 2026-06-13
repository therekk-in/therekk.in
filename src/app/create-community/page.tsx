"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import { CATEGORIES } from "@/lib/constants";

export default function CreateCommunityPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [rules, setRules] = useState("");
  const [picture, setPicture] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          router.push("/auth/login");
          return;
        }
        setLoading(false);
      });
  }, [router]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    const r = await fetch("/api/upload/thumbnail", { method: "POST", body: fd });
    const d = await r.json();
    if (d.url) setPicture(d.url);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 3 || name.length > 30) {
      toast.error("Name must be 3-30 characters");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category,
          profilePicture: picture,
          rules: rules
            .split("\n")
            .map((r) => r.trim())
            .filter(Boolean),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      toast.success("Community created!");
      router.push(`/community/${d.community.id}`);
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6">
      <Link
        href="/"
        className="text-sm text-app-muted hover:text-app inline-flex items-center gap-1 mb-3"
      >
        ← Back
      </Link>
      <h1 className="text-2xl sm:text-3xl font-black">Create a community</h1>
      <p className="text-sm text-app-muted mt-1">
        Build a space for your repair niche
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_]+"
            className="w-full h-11 px-4 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition"
            placeholder="e.g. iphone_repair"
          />
          <p className="text-xs text-app-muted mt-1">
            3-30 characters. Letters, numbers, underscores only. Cannot be
            changed later.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition resize-none"
            placeholder="What is this community about?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Rules (one per line)
          </label>
          <textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition resize-none"
            placeholder="Be respectful&#10;No spam&#10;Stay on topic"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Profile picture
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="block w-full text-sm text-app file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          {picture && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={picture}
              alt=""
              className="mt-3 h-20 w-20 rounded-full object-cover"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto h-12 px-8 rounded-full btn-primary font-bold transition disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create community"}
        </button>
      </form>
    </div>
  );
}

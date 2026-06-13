"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import { CATEGORIES } from "@/lib/constants";

export default function UploadPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          router.push("/auth/login");
          return;
        }
        setUser(d.user);
        setLoading(false);
      });
    fetch("/api/communities?limit=50")
      .then((r) => r.json())
      .then((d) => setCommunities(d.communities || []));
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length < 3) {
      toast.error("Title must be at least 3 characters");
      return;
    }
    if (!videoFile) {
      toast.error("Please select a video file");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }

    setSubmitting(true);
    setProgress(10);
    try {
      // 1) Upload video file
      const videoForm = new FormData();
      videoForm.append("file", videoFile);
      const videoRes = await fetch("/api/upload/video", {
        method: "POST",
        body: videoForm,
      });
      const videoData = await videoRes.json();
      if (!videoRes.ok) throw new Error(videoData.error || "Video upload failed");
      setProgress(50);

      // 2) Upload thumbnail (optional)
      let thumbnailUrl = "";
      if (thumbnailFile) {
        const thumbForm = new FormData();
        thumbForm.append("file", thumbnailFile);
        const thumbRes = await fetch("/api/upload/thumbnail", {
          method: "POST",
          body: thumbForm,
        });
        const thumbData = await thumbRes.json();
        if (thumbRes.ok) thumbnailUrl = thumbData.url;
      } else {
        // Auto-generate placeholder thumbnail
        thumbnailUrl = "";
      }
      setProgress(70);

      // 3) Upload subtitle (optional)
      let subtitleUrl = "";
      if (subtitleFile) {
        const subForm = new FormData();
        subForm.append("file", subtitleFile);
        const subRes = await fetch("/api/upload/thumbnail", {
          method: "POST",
          body: subForm,
        });
        const subData = await subRes.json();
        if (subRes.ok) subtitleUrl = subData.url;
      }
      setProgress(85);

      // 4) Create video record
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          tags: tagList,
          communityId: communityId || null,
          telegramFileId: videoData.fileId,
          videoUrl: videoData.provider === "dataurl" ? "" : "",
          thumbnailUrl,
          subtitleUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save video");
      setProgress(100);
      toast.success("Video uploaded!");
      router.push(`/video/${data.video.id}`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
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
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
      <Link
        href="/"
        className="text-sm text-app-muted hover:text-app inline-flex items-center gap-1 mb-3"
      >
        ← Back
      </Link>
      <h1 className="text-2xl sm:text-3xl font-black">Upload a video</h1>
      <p className="text-sm text-app-muted mt-1">
        Share your repair knowledge with the community
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Video file *</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            required
            className="block w-full text-sm text-app file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            maxLength={200}
            className="w-full h-11 px-4 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition"
            placeholder="e.g. iPhone 12 screen replacement guide"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition resize-none"
            placeholder="Describe the repair, tools needed, difficulty level…"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full h-11 px-3 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Community</label>
            <select
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition"
            >
              <option value="">None</option>
              {communities.map((c: any) => (
                <option key={c.id} value={c.id}>
                  c/{c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition"
            placeholder="iphone, screen replacement, repair"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Thumbnail (optional, auto-generated if empty)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-app file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Subtitle file (.srt or .vtt, optional)
          </label>
          <input
            type="file"
            accept=".srt,.vtt"
            onChange={(e) => setSubtitleFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-app file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>

        {submitting && (
          <div className="h-2 rounded-full bg-app-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto h-12 px-8 rounded-full btn-primary font-bold transition disabled:opacity-60"
        >
          {submitting ? `Uploading… ${progress}%` : "Publish video"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

export default function CreatePostPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const toast = useToast();
  const editId = sp.get("id");
  const presetCommunity = sp.get("communityId");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [tags, setTags] = useState("");
  const [communityId, setCommunityId] = useState(presetCommunity || "");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

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

    if (editId) {
      fetch(`/api/posts/${editId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.post) {
            setTitle(d.post.title);
            setContent(d.post.content);
            setLinkUrl(d.post.linkUrl);
            setCommunityId(d.post.communityId || "");
            setTags(((d.post.tags as string[]) || []).join(", "));
            setImages((d.post.images as string[]) || []);
          }
        });
    }
  }, [router, editId]);

  const onUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4 - images.length);
    for (const f of files) {
      const fd = new FormData();
      fd.append("file", f);
      const r = await fetch("/api/upload/thumbnail", { method: "POST", body: fd });
      const d = await r.json();
      if (d.url) setImages((imgs) => [...imgs, d.url]);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length < 3) {
      toast.error("Title must be at least 3 characters");
      return;
    }
    setSubmitting(true);
    try {
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (editId) {
        const r = await fetch(`/api/posts/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            linkUrl,
            tags: tagList,
            communityId: communityId || null,
          }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Failed");
        toast.success("Post updated");
        router.push(`/post/${editId}`);
      } else {
        const r = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            linkUrl,
            images,
            tags: tagList,
            communityId: communityId || null,
          }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Failed");
        toast.success("Post created");
        router.push(`/post/${d.post.id}`);
      }
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
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
      <Link
        href="/"
        className="text-sm text-app-muted hover:text-app inline-flex items-center gap-1 mb-3"
      >
        ← Back
      </Link>
      <h1 className="text-2xl sm:text-3xl font-black">
        {editId ? "Edit post" : "Create a post"}
      </h1>
      <p className="text-sm text-app-muted mt-1">
        Share a question, repair log, or guide
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Community</label>
          <select
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition"
          >
            <option value="">No community (your profile)</option>
            {communities.map((c: any) => (
              <option key={c.id} value={c.id}>
                c/{c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            maxLength={300}
            className="w-full h-11 px-4 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition"
            placeholder="What's your post about?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Content (Markdown supported)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition resize-y font-mono text-sm"
            placeholder="Write your post here…"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Link (optional)
          </label>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition"
            placeholder="https://example.com/related-article"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onUploadImages}
            disabled={images.length >= 4}
            className="block w-full text-sm text-app file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt=""
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages((imgs) => imgs.filter((_, j) => j !== i))
                    }
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs grid place-items-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
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
            placeholder="iphone, repair, screen"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto h-12 px-8 rounded-full btn-primary font-bold transition disabled:opacity-60"
        >
          {submitting ? "Publishing…" : editId ? "Save changes" : "Post"}
        </button>
      </form>
    </div>
  );
}

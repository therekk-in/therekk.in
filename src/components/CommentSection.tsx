"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { timeAgo, formatNumber } from "@/lib/utils";
import { VerifiedBadge } from "@/components/VideoCard";

export interface Comment {
  id: string;
  userId: string;
  contentType: string;
  contentId: string;
  parentId: string | null;
  text: string;
  likesCount: number;
  isPinned: boolean;
  createdAt: string;
  userName: string;
  userUsername: string;
  userPicture: string;
  userVerified: boolean;
}

export default function CommentSection({
  contentType,
  contentId,
  commentsEnabled,
  currentUserId,
}: {
  contentType: "video" | "post";
  contentId: string;
  commentsEnabled: boolean;
  currentUserId?: string;
}) {
  const toast = useToast();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = async (off = 0, append = false) => {
    try {
      const r = await fetch(
        `/api/comments?contentType=${contentType}&contentId=${contentId}&offset=${off}`
      );
      const d = await r.json();
      if (append) {
        setComments((c) => [...c, ...d.comments]);
      } else {
        setComments(d.comments);
      }
      setHasMore(d.hasMore);
      setOffset(off + d.comments.length);
    } catch {
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    load(0, false);
  }, [contentId, contentType]);

  const submit = async () => {
    if (!text.trim()) return;
    if (!currentUserId) {
      toast.info("Please log in to comment");
      router.push("/auth/login");
      return;
    }
    setPosting(true);
    try {
      const r = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          contentId,
          text,
          parentId: replyTo,
        }),
      });
      if (!r.ok) throw new Error();
      setText("");
      setReplyTo(null);
      await load(0, false);
      toast.success("Comment posted");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const onLike = async (id: string) => {
    if (!currentUserId) {
      toast.info("Please log in");
      return;
    }
    setComments((cs) =>
      cs.map((c) =>
        c.id === id ? { ...c, likesCount: c.likesCount + 1 } : c
      )
    );
    try {
      await fetch(`/api/comments/${id}/like`, { method: "POST" });
    } catch {}
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await fetch(`/api/comments/${id}`, { method: "DELETE" });
      setComments((cs) => cs.filter((c) => c.id !== id));
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const onEdit = async (id: string) => {
    if (!editText.trim()) return;
    try {
      await fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText }),
      });
      setComments((cs) =>
        cs.map((c) => (c.id === id ? { ...c, text: editText } : c))
      );
      setEditing(null);
      toast.success("Comment updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  const onReport = async (id: string) => {
    const reason = prompt("Reason for reporting:");
    if (!reason) return;
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "comment",
          contentId: id,
          reason,
        }),
      });
      toast.success("Reported");
    } catch {
      toast.error("Failed to report");
    }
  };

  const topLevel = comments.filter((c) => !c.parentId);
  const getReplies = (id: string) =>
    comments.filter((c) => c.parentId === id);

  if (!commentsEnabled) {
    return (
      <div className="rounded-2xl border border-app bg-card p-6 text-center text-sm text-app-muted">
        💬 Comments are disabled for this {contentType}.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-app bg-card p-5">
      <h3 className="font-bold text-lg mb-4">
        {comments.length} Comment{comments.length !== 1 ? "s" : ""}
      </h3>

      {currentUserId ? (
        <div className="mb-5">
          {replyTo && (
            <div className="flex items-center justify-between text-xs text-app-muted mb-2">
              <span>Replying to comment</span>
              <button
                onClick={() => setReplyTo(null)}
                className="text-primary hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="w-full rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none p-3 text-sm transition resize-none"
            placeholder="Add a comment…"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={submit}
              disabled={posting || !text.trim()}
              className="h-9 px-5 rounded-full btn-primary text-sm font-semibold transition disabled:opacity-50"
            >
              {posting ? "Posting…" : "Comment"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-5 p-3 rounded-xl bg-app-muted text-sm text-app-muted text-center">
          <Link href="/auth/login" className="text-primary font-semibold">
            Log in
          </Link>{" "}
          to comment.
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl skeleton"
            />
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <p className="text-sm text-app-muted text-center py-8">
          No comments yet. Be the first!
        </p>
      ) : (
        <ul className="space-y-4">
          {topLevel.map((c) => (
            <CommentItem
              key={c.id}
              c={c}
              currentUserId={currentUserId}
              replies={getReplies(c.id)}
              onReply={() => setReplyTo(c.id)}
              onLike={() => onLike(c.id)}
              onDelete={() => onDelete(c.id)}
              onEdit={() => {
                setEditing(c.id);
                setEditText(c.text);
              }}
              onReport={() => onReport(c.id)}
              editing={editing}
              editText={editText}
              setEditText={setEditText}
              saveEdit={() => onEdit(c.id)}
              cancelEdit={() => setEditing(null)}
            />
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setLoadingMore(true);
              load(offset, true);
            }}
            disabled={loadingMore}
            className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more comments"}
          </button>
        </div>
      )}
    </div>
  );
}

function CommentItem({
  c,
  currentUserId,
  replies,
  onReply,
  onLike,
  onDelete,
  onEdit,
  onReport,
  editing,
  editText,
  setEditText,
  saveEdit,
  cancelEdit,
}: {
  c: Comment;
  currentUserId?: string;
  replies: Comment[];
  onReply: () => void;
  onLike: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onReport: () => void;
  editing: string | null;
  editText: string;
  setEditText: (s: string) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
}) {
  return (
    <li>
      <div className="flex gap-3">
        <Link
          href={`/profile/${c.userUsername}`}
          className="h-9 w-9 rounded-full overflow-hidden bg-app-muted grid place-items-center text-sm font-bold border border-app shrink-0"
        >
          {c.userPicture?.startsWith("http") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.userPicture}
              alt={c.userName}
              className="h-full w-full object-cover"
            />
          ) : c.userPicture ? (
            <span className="text-base">{c.userPicture}</span>
          ) : (
            <span>{c.userName?.[0]?.toUpperCase()}</span>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-xs">
            <Link
              href={`/profile/${c.userUsername}`}
              className="font-semibold hover:text-primary"
            >
              {c.userName}
            </Link>
            {c.userVerified && <VerifiedBadge />}
            <span className="text-app-muted">·</span>
            <span className="text-app-muted">{timeAgo(c.createdAt)}</span>
            {c.isPinned && (
              <span className="ml-2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                Pinned
              </span>
            )}
          </div>
          {editing === c.id ? (
            <div className="mt-1">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full rounded-lg bg-app-muted border border-app p-2 text-sm outline-none focus:border-primary"
                rows={2}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={saveEdit}
                  className="h-8 px-3 rounded-full btn-primary text-xs font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="h-8 px-3 rounded-full border border-app text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-1 whitespace-pre-wrap break-words">
              {c.text}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-3 text-xs text-app-muted">
            <button
              onClick={onLike}
              className="hover:text-primary flex items-center gap-1"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M7 11V21M4 5v16h3V5H4zM7 5h10l-2 6h5l-3 10H7" />
              </svg>
              {formatNumber(c.likesCount)}
            </button>
            <button onClick={onReply} className="hover:text-primary">
              Reply
            </button>
            {currentUserId === c.userId && (
              <>
                <button onClick={onEdit} className="hover:text-primary">
                  Edit
                </button>
                <button onClick={onDelete} className="hover:text-red-500">
                  Delete
                </button>
              </>
            )}
            {currentUserId && currentUserId !== c.userId && (
              <button onClick={onReport} className="hover:text-red-500">
                Report
              </button>
            )}
          </div>
        </div>
      </div>
      {replies.length > 0 && (
        <ul className="ml-12 mt-3 space-y-3 border-l-2 border-app pl-3">
          {replies.map((r) => (
            <CommentItem
              key={r.id}
              c={r}
              currentUserId={currentUserId}
              replies={[]}
              onReply={onReply}
              onLike={() => onLike()}
              onDelete={() => onDelete()}
              onEdit={() => onEdit()}
              onReport={() => onReport()}
              editing={editing}
              editText={editText}
              setEditText={setEditText}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

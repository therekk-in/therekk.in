import Link from "next/link";
import { timeAgo, formatNumber, truncate } from "@/lib/utils";
import { VerifiedBadge } from "./VideoCard";

export interface PostCardData {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  downvotes: number;
  commentsCount: number;
  createdAt: Date | string;
  userId: string;
  userName: string;
  userUsername: string;
  userPicture: string;
  userVerified: boolean;
  communityId: string | null;
  communityName: string | null;
}

export function PostCard({ p }: { p: PostCardData }) {
  const score = p.upvotes - p.downvotes;
  return (
    <Link
      href={`/post/${p.id}`}
      className="group flex gap-3 rounded-2xl bg-card border border-app p-4 hover:border-primary/40 transition-all"
    >
      <div className="hidden sm:flex flex-col items-center justify-start min-w-[3rem] pt-1">
        <svg
          className="h-5 w-5 text-app-muted group-hover:text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
        <span className="text-sm font-bold my-1">{formatNumber(score)}</span>
        <svg
          className="h-5 w-5 text-app-muted group-hover:text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-xs text-app-muted flex-wrap">
          {p.communityName && (
            <>
              <span className="font-semibold text-app">
                c/{p.communityName}
              </span>
              <span>·</span>
            </>
          )}
          <span>Posted by</span>
          <Link
            href={`/profile/${p.userUsername}`}
            className="hover:text-primary font-medium"
          >
            u/{p.userUsername}
          </Link>
          {p.userVerified && <VerifiedBadge />}
          <span>·</span>
          <span>{timeAgo(p.createdAt)}</span>
        </div>
        <h3 className="mt-1 text-lg font-semibold leading-snug line-clamp-2 group-hover:text-primary transition">
          {p.title}
        </h3>
        <p className="mt-1 text-sm text-app-muted line-clamp-3">
          {truncate(p.content, 200)}
        </p>
        <div className="mt-2 flex items-center gap-4 text-xs text-app-muted">
          <span className="flex items-center gap-1 sm:hidden">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
            {formatNumber(score)}
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {formatNumber(p.commentsCount)} comments
          </span>
        </div>
      </div>
    </Link>
  );
}

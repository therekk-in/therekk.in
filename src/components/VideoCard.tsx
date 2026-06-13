import Link from "next/link";
import { timeAgo, formatNumber } from "@/lib/utils";

export interface VideoCardData {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  viewsCount: number;
  likesCount: number;
  createdAt: Date | string;
  category: string;
  userId: string;
  userName: string;
  userUsername: string;
  userPicture: string | null;
  userVerified: boolean;
}

export function VideoCard({ v }: { v: VideoCardData }) {
  return (
    <Link
      href={`/video/${v.id}`}
      className="group block rounded-2xl overflow-hidden bg-card border border-app hover:border-primary/40 transition-all"
    >
      <div className="relative aspect-video bg-app-muted overflow-hidden">
        {v.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={v.thumbnailUrl}
            alt={v.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            🎬
          </div>
        )}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[11px] font-medium">
          Video
        </div>
      </div>
      <div className="p-3 flex gap-3">
        <Link
          href={`/profile/${v.userUsername}`}
          className="shrink-0 h-9 w-9 rounded-full overflow-hidden bg-app-muted grid place-items-center text-sm font-bold border border-app"
        >
          {v.userPicture?.startsWith?.("http") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={v.userPicture}
              alt={v.userName}
              className="h-full w-full object-cover"
            />
          ) : v.userPicture ? (
            <span className="text-lg">{v.userPicture}</span>
          ) : (
            <span>{v.userName?.[0]?.toUpperCase() || "U"}</span>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition">
            {v.title}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-app-muted">
            <span className="truncate">{v.userName}</span>
            {v.userVerified && <VerifiedBadge />}
            <span>·</span>
            <span>{formatNumber(v.viewsCount)} views</span>
            <span>·</span>
            <span>{timeAgo(v.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function VerifiedBadge() {
  return (
    <svg
      className="inline h-3.5 w-3.5 text-primary"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

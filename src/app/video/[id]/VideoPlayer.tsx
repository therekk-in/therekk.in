"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { formatNumber, timeAgo } from "@/lib/utils";
import { VerifiedBadge } from "@/components/VideoCard";

interface VideoPlayerProps {
  id: string;
  title: string;
  description: string | null;
  videoSrc: string;
  subtitleUrl: string | null;
  thumbnail: string | null;
  initialLikes: number;
  initialViews: number;
  isOwner: boolean;
  commentsEnabled: boolean;
  isLoggedIn: boolean;
  currentUserId?: string;
  creator: {
    id: string;
    username: string;
    displayName: string | null;
    profilePicture: string | null;
    isVerified: boolean;
    followersCount: number;
  };
  community: { id: string; name: string } | null;
}

const QUALITIES = ["360p", "480p", "720p", "1080p"];
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function VideoPlayer({
  id,
  title,
  description,
  videoSrc,
  subtitleUrl,
  thumbnail,
  initialLikes,
  initialViews,
  isOwner,
  isLoggedIn,
  currentUserId,
  creator,
  community,
}: VideoPlayerProps) {
  const router = useRouter();
  const toast = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [quality, setQuality] = useState("Auto");
  const [speed, setSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [subtitlesOn, setSubtitlesOn] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [miniPlayer, setMiniPlayer] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [followers, setFollowers] = useState(creator.followersCount ?? 0);
  const [following, setFollowing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [subsOn, setSubsOn] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`/api/videos/${id}/status`)
      .then((r) => r.json())
      .then((d) => {
        setLiked(!!d.liked);
        setSaved(!!d.saved);
        if (d.subsOn) setSubsOn(true);
      })
      .catch(() => {});
    if (creator.id) {
      fetch(`/api/users/${creator.username}/status`)
        .then((r) => r.json())
        .then((d) => setFollowing(!!d.following))
        .catch(() => {});
    }
  }, [id, isLoggedIn, creator.id, creator.username]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const onTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };
  const onLoaded = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const seek = (t: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = t;
      setCurrentTime(t);
    }
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const onLike = async () => {
    if (!isLoggedIn) {
      toast.info("Please log in to like videos");
      router.push("/auth/login");
      return;
    }
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes((n) => n + (wasLiked ? -1 : 1));
    try {
      await fetch(`/api/videos/${id}/like`, { method: "POST" });
    } catch {
      setLiked(wasLiked);
      setLikes((n) => n + (wasLiked ? 1 : -1));
    }
  };

  const onSave = async () => {
    if (!isLoggedIn) {
      toast.info("Please log in to save videos");
      return;
    }
    try {
      const r = await fetch(`/api/videos/${id}/save`, { method: "POST" });
      const d = await r.json();
      setSaved(d.saved);
      toast.success(d.saved ? "Saved" : "Removed from saved");
    } catch {
      toast.error("Failed to save");
    }
  };

  const onFollow = async () => {
    if (!isLoggedIn) {
      toast.info("Please log in");
      return;
    }
    const was = following;
    setFollowing(!was);
    setFollowers((n) => n + (was ? -1 : 1));
    try {
      await fetch(`/api/users/${creator.username}/follow`, {
        method: "POST",
      });
    } catch {
      setFollowing(was);
      setFollowers((n) => n + (was ? 1 : -1));
    }
  };

  const onShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: window.location.href,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const submitReport = async (reason: string) => {
    try {
      const r = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "video",
          contentId: id,
          reason,
        }),
      });
      if (!r.ok) throw new Error();
      toast.success("Report submitted. Thank you.");
      setShowReport(false);
    } catch {
      toast.error("Failed to submit report");
    }
  };

  const hasVideo = !!videoSrc;
  const isDataUrl = videoSrc?.startsWith("data:");

  return (
    <div>
      <div
        ref={containerRef}
        className={`relative bg-black rounded-2xl overflow-hidden ${
          miniPlayer ? "fixed bottom-4 right-4 w-80 z-50 shadow-2xl" : ""
        }`}
      >
        <div className="aspect-video">
          {hasVideo ? (
            <video
              ref={videoRef}
              src={videoSrc}
              poster={thumbnail ?? undefined}
              className="h-full w-full"
              onClick={togglePlay}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={onLoaded}
              muted={muted}
            >
              {subtitleUrl && (
                <track
                  kind="subtitles"
                  src={subtitleUrl}
                  srcLang="en"
                  label="English"
                  default={subtitlesOn}
                />
              )}
            </video>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-white/70 gap-2">
              <div className="text-5xl">🎬</div>
              <p className="text-sm">Video unavailable</p>
            </div>
          )}
        </div>

        {hasVideo && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ display: playing ? "none" : "flex" }}
          >
            <button
              onClick={togglePlay}
              className="pointer-events-auto h-16 w-16 grid place-items-center rounded-full bg-black/50 hover:bg-primary text-white transition"
            >
              <svg className="h-7 w-7 ml-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}

        {hasVideo && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 text-white">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex items-center gap-2 mt-1 text-xs">
              <button onClick={togglePlay} className="hover:text-primary">
                {playing ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <span>
                {fmt(currentTime)} / {fmt(duration)}
              </span>
              <div className="flex-1" />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMuted((m) => !m)}
                  className="hover:text-primary"
                >
                  {muted || volume === 0 ? (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    setMuted(v === 0);
                    if (videoRef.current) videoRef.current.volume = v;
                  }}
                  className="w-16 accent-primary"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSettings((s) => !s);
                    setShowSpeed(false);
                    setShowQuality(false);
                  }}
                  className="hover:text-primary"
                  title="Settings"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
                {showSettings && (
                  <div className="absolute bottom-8 right-0 bg-black/95 rounded-lg text-white min-w-[160px] p-1 shadow-2xl border border-white/10">
                    <button
                      onClick={() => {
                        setShowSpeed((s) => !s);
                        setShowQuality(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm flex items-center justify-between"
                    >
                      Speed <span className="text-white/60">{speed}x</span>
                    </button>
                    {showSpeed && (
                      <div className="border-t border-white/10 mt-1 pt-1">
                        {SPEEDS.map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              setSpeed(s);
                              setShowSettings(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 hover:bg-white/10 text-sm ${
                              speed === s ? "text-primary" : ""
                            }`}
                          >
                            {s === 1 ? "1x (Normal)" : `${s}x`}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setShowQuality((s) => !s);
                        setShowSpeed(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm flex items-center justify-between"
                    >
                      Quality <span className="text-white/60">{quality}</span>
                    </button>
                    {showQuality && (
                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setQuality("Auto");
                            setShowSettings(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-sm"
                        >
                          Auto
                        </button>
                        {QUALITIES.map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              setQuality(q);
                              setShowSettings(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 hover:bg-white/10 text-sm ${
                              quality === q ? "text-primary" : ""
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                    {subtitleUrl && (
                      <button
                        onClick={() => {
                          setSubtitlesOn((s) => !s);
                          setShowSettings(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm"
                      >
                        Subtitles {subtitlesOn ? "On" : "Off"}
                      </button>
                    )}
                  </div>
                )}
              </div>
              {hasVideo && (
                <button
                  onClick={() => setMiniPlayer((m) => !m)}
                  className="hover:text-primary"
                  title="Mini player"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h1 className="text-xl sm:text-2xl font-bold leading-tight">{title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-app-muted">
          <span>{formatNumber(initialViews)} views</span>
          <span>·</span>
          <span>2 days ago</span>
          {community && (
            <>
              <span>·</span>
              <Link
                href={`/community/${community.id}`}
                className="text-primary font-medium hover:underline"
              >
                c/{community.name}
              </Link>
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={onLike}
            className={`flex items-center gap-2 h-10 px-4 rounded-full border transition ${
              liked
                ? "border-primary bg-primary/10 text-primary"
                : "border-app hover:bg-app-muted"
            }`}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="font-semibold">{formatNumber(likes)}</span>
          </button>
          <button
            onClick={onShare}
            className="flex items-center gap-2 h-10 px-4 rounded-full border border-app hover:bg-app-muted transition"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span className="font-semibold">Share</span>
          </button>
          <button
            onClick={onSave}
            className={`flex items-center gap-2 h-10 px-4 rounded-full border transition ${
              saved
                ? "border-primary bg-primary/10 text-primary"
                : "border-app hover:bg-app-muted"
            }`}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill={saved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span className="font-semibold">{saved ? "Saved" : "Save"}</span>
          </button>
          {!isOwner && (
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center gap-2 h-10 px-4 rounded-full border border-app hover:bg-app-muted transition ml-auto"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
              <span className="font-semibold hidden sm:inline">Report</span>
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3 p-4 rounded-2xl bg-card border border-app">
          <Link
            href={`/profile/${creator.username}`}
            className="h-12 w-12 rounded-full overflow-hidden bg-app-muted grid place-items-center text-lg font-bold shrink-0 border border-app"
          >
              {creator.profilePicture?.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={creator.profilePicture}
                alt={creator.displayName ?? "User"}
                className="h-full w-full object-cover"
              />
            ) : creator.profilePicture ? (
              <span className="text-2xl">{creator.profilePicture}</span>
            ) : (
              <span>{(creator.displayName ?? "U")[0]?.toUpperCase()}</span>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              href={`/profile/${creator.username}`}
              className="font-bold flex items-center gap-1 hover:text-primary"
            >
              {creator.displayName}
              {creator.isVerified && <VerifiedBadge />}
            </Link>
            <p className="text-sm text-app-muted">
              {formatNumber(followers)} followers
            </p>
          </div>
          {!isOwner && currentUserId !== creator.id && (
            <button
              onClick={onFollow}
              className={`h-10 px-5 rounded-full font-semibold transition ${
                following
                  ? "bg-app-muted text-app"
                  : "btn-primary"
              }`}
            >
              {following ? "Following" : "Follow"}
            </button>
          )}
        </div>

        {description && (
          <div className="mt-4 p-4 rounded-2xl bg-card border border-app">
            <p
              className={`text-sm whitespace-pre-wrap ${
                expanded ? "" : "line-clamp-3"
              }`}
            >
              {description}
            </p>
            {description.length > 150 && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-sm font-semibold text-primary mt-2"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}
      </div>

      {showReport && (
        <Modal onClose={() => setShowReport(false)} title="Report video">
          <p className="text-sm text-app-muted mb-3">
            What's wrong with this video?
          </p>
          <div className="space-y-2">
            {[
              "Spam",
              "Inappropriate content",
              "Misinformation",
              "Harassment",
              "Other",
            ].map((r) => (
              <button
                key={r}
                onClick={() => submitReport(r)}
                className="w-full text-left px-4 py-2.5 rounded-lg border border-app hover:border-primary hover:bg-primary/5 transition text-sm"
              >
                {r}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-card border border-app p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-full hover:bg-app-muted"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

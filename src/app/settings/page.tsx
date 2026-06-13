"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import { EMOJI_AVATARS } from "@/lib/constants";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"profile" | "privacy" | "notifications" | "account">(
    "profile"
  );

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
  const [website, setWebsite] = useState("");

  const [isPrivate, setIsPrivate] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [notifFollow, setNotifFollow] = useState(true);
  const [notifLike, setNotifLike] = useState(true);
  const [notifComment, setNotifComment] = useState(true);
  const [notifCommunity, setNotifCommunity] = useState(true);
  const [notifAnnounce, setNotifAnnounce] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          router.push("/auth/login");
          return;
        }
        fetch(`/api/users/${d.user.username}`)
          .then((r) => r.json())
          .then((ud) => {
            const u = ud.user;
            if (u) {
              setUser(u);
              setDisplayName(u.displayName);
              setUsername(u.username);
              setBio(u.bio || "");
              setProfilePicture(u.profilePicture || "");
              setIsPrivate(u.isPrivate);
              setShowEmail(u.showEmail);
              const sl = u.socialLinks || {};
              setInstagram(sl.instagram || "");
              setTwitter(sl.twitter || "");
              setYoutube(sl.youtube || "");
              setWebsite(sl.website || "");
              const ns = u.notificationSettings || {};
              setNotifFollow(ns.follow !== false);
              setNotifLike(ns.like !== false);
              setNotifComment(ns.comment !== false);
              setNotifCommunity(ns.community !== false);
              setNotifAnnounce(ns.announcement !== false);
              setEmailEnabled(!!ns.emailEnabled);
            }
            setLoading(false);
          });
      });
  }, [router]);

  const saveProfile = async () => {
    try {
      const r = await fetch(`/api/users/${user.username}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          username,
          bio,
          profilePicture,
          socialLinks: {
            instagram: instagram || undefined,
            twitter: twitter || undefined,
            youtube: youtube || undefined,
            website: website || undefined,
          },
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      toast.success("Profile updated");
      if (username !== user.username) {
        router.push(`/profile/${username}`);
      } else {
        router.refresh();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const savePrivacy = async () => {
    try {
      const r = await fetch(`/api/users/${user.username}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrivate, showEmail }),
      });
      if (!r.ok) throw new Error();
      toast.success("Privacy settings saved");
    } catch {
      toast.error("Failed");
    }
  };

  const saveNotifications = async () => {
    try {
      const r = await fetch(`/api/users/${user.username}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationSettings: {
            follow: notifFollow,
            like: notifLike,
            comment: notifComment,
            community: notifCommunity,
            announcement: notifAnnounce,
            emailEnabled,
          },
        }),
      });
      if (!r.ok) throw new Error();
      toast.success("Notification settings saved");
    } catch {
      toast.error("Failed");
    }
  };

  const onDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    )
      return;
    if (!confirm("Really delete? All your content will be removed.")) return;
    // For demo: just log out
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const onUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    const r = await fetch("/api/upload/thumbnail", { method: "POST", body: fd });
    const d = await r.json();
    if (d.url) setProfilePicture(d.url);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const tabs = [
    { key: "profile", label: "Profile" },
    { key: "privacy", label: "Privacy" },
    { key: "notifications", label: "Notifications" },
    { key: "account", label: "Account" },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
      <h1 className="text-2xl sm:text-3xl font-black">Settings</h1>

      <div className="mt-6 flex gap-2 border-b border-app overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-app-muted hover:text-app"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-5">
        {tab === "profile" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Avatar</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {EMOJI_AVATARS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setProfilePicture(e)}
                    className={`h-12 w-12 rounded-full grid place-items-center text-2xl border-2 transition ${
                      profilePicture === e
                        ? "border-primary bg-primary/10"
                        : "border-app hover:border-app-muted"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={onUploadAvatar}
                className="block text-sm text-app file:mr-4 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary"
              />
            </div>
            <Field label="Display name">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Username">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Bio">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="input resize-none"
              />
            </Field>
            <Field label="Social links">
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="url"
                  placeholder="Instagram URL"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="input"
                />
                <input
                  type="url"
                  placeholder="Twitter URL"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="input"
                />
                <input
                  type="url"
                  placeholder="YouTube URL"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  className="input"
                />
                <input
                  type="url"
                  placeholder="Website URL"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="input"
                />
              </div>
            </Field>
            <button
              onClick={saveProfile}
              className="h-11 px-6 rounded-full btn-primary font-semibold"
            >
              Save changes
            </button>
          </>
        )}

        {tab === "privacy" && (
          <>
            <Toggle
              label="Make profile private"
              desc="Only followers can see your content"
              value={isPrivate}
              onChange={setIsPrivate}
            />
            <Toggle
              label="Show email on profile"
              desc="Display your email publicly"
              value={showEmail}
              onChange={setShowEmail}
            />
            <button
              onClick={savePrivacy}
              className="h-11 px-6 rounded-full btn-primary font-semibold"
            >
              Save privacy
            </button>
          </>
        )}

        {tab === "notifications" && (
          <>
            <Toggle
              label="New followers"
              desc="When someone follows you"
              value={notifFollow}
              onChange={setNotifFollow}
            />
            <Toggle
              label="Likes"
              desc="When someone likes your content"
              value={notifLike}
              onChange={setNotifLike}
            />
            <Toggle
              label="Comments"
              desc="When someone comments on your content"
              value={notifComment}
              onChange={setNotifComment}
            />
            <Toggle
              label="Community posts"
              desc="New posts in your communities"
              value={notifCommunity}
              onChange={setNotifCommunity}
            />
            <Toggle
              label="Admin announcements"
              desc="Important updates from the team"
              value={notifAnnounce}
              onChange={setNotifAnnounce}
            />
            <hr className="border-app" />
            <Toggle
              label="Email notifications"
              desc="Also send notifications via email"
              value={emailEnabled}
              onChange={setEmailEnabled}
            />
            <hr className="border-app" />
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <div className="flex gap-2">
                {(["light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-4 h-10 rounded-full text-sm font-semibold border transition ${
                      theme === t
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-app"
                    }`}
                  >
                    {t === "light" ? "☀️ Light" : "🌙 Dark"}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={saveNotifications}
              className="h-11 px-6 rounded-full btn-primary font-semibold"
            >
              Save notifications
            </button>
          </>
        )}

        {tab === "account" && (
          <>
            <Link
              href="/saved"
              className="block rounded-2xl border border-app bg-card p-4 hover:border-primary transition"
            >
              <p className="font-semibold">Saved & Bookmarks →</p>
              <p className="text-sm text-app-muted">
                View your saved videos and posts
              </p>
            </Link>
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
              <h3 className="font-bold text-red-500">Danger zone</h3>
              <p className="text-sm text-app-muted mt-1">
                Once you delete your account, there is no going back.
              </p>
              <button
                onClick={onDeleteAccount}
                className="mt-3 h-10 px-4 rounded-full bg-red-500 text-white text-sm font-semibold"
              >
                Delete account
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          background: var(--color-bg-muted);
          border: 1px solid transparent;
          outline: none;
          color: var(--color-text);
          transition: all 0.15s;
        }
        :global(.input:focus) {
          border-color: var(--color-primary);
          background: var(--color-bg);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-app bg-card">
      <div>
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-app-muted mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition ${
          value ? "bg-primary" : "bg-app-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            value ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

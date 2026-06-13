"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";

export interface NavbarUser {
  id: string;
  username: string;
  displayName: string;
  profilePicture: string | null;
  isAdmin: boolean;
}

export default function Navbar({ user }: { user: NavbarUser | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetch("/api/notifications/unread-count")
        .then((r) => r.json())
        .then((d) => setUnread(d.count || 0))
        .catch(() => {});
    }
  }, [user, pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/search?type=videos", label: "Videos" },
    { href: "/search?type=posts", label: "Posts" },
    { href: "/search?type=communities", label: "Communities" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-app bg-app/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-black text-sm">
            TX
          </div>
          <span className="text-xl font-black tracking-tight hidden xs:inline sm:inline">
            <span className="text-primary">THERE</span>
            <span className="text-app">KK</span>
          </span>
        </Link>

        <form
          onSubmit={onSearch}
          className="flex-1 max-w-2xl mx-2 hidden md:block"
        >
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos, posts, communities, users…"
              className="w-full rounded-full bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none pl-11 pr-4 py-2.5 text-sm text-app placeholder:text-app-muted transition"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-app-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="h-9 w-9 grid place-items-center rounded-full hover:bg-app-muted text-app-muted hover:text-app transition"
          >
            {theme === "dark" ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {user ? (
            <>
              <Link
                href="/upload"
                className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-full btn-primary text-sm font-semibold transition"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Upload
              </Link>
              <Link
                href="/notifications"
                className="relative h-9 w-9 grid place-items-center rounded-full hover:bg-app-muted text-app-muted hover:text-app transition"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unread > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-4 px-1 grid place-items-center text-[10px] font-bold rounded-full bg-primary text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="h-9 w-9 rounded-full overflow-hidden border border-app bg-app-muted grid place-items-center text-base"
                >
                  {user.profilePicture ? (
                    user.profilePicture.startsWith("http") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.profilePicture}
                        alt={user.displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">{user.profilePicture}</span>
                    )
                  ) : (
                    <span className="text-sm font-bold text-app-muted">
                      {user.displayName[0]?.toUpperCase()}
                    </span>
                  )}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-app bg-card shadow-2xl py-1 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-app">
                      <p className="text-sm font-semibold truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-app-muted truncate">
                        @{user.username}
                      </p>
                    </div>
                    <Link
                      href={`/profile/${user.username}`}
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-sm hover:bg-app-muted"
                    >
                      My profile
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-sm hover:bg-app-muted"
                    >
                      Creator dashboard
                    </Link>
                    <Link
                      href="/saved"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-sm hover:bg-app-muted"
                    >
                      Saved
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-sm hover:bg-app-muted"
                    >
                      Settings
                    </Link>
                    {user.isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-sm hover:bg-app-muted text-primary font-semibold"
                      >
                        Admin panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-app-muted text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden sm:inline-block h-9 px-4 grid place-items-center rounded-full text-sm font-semibold hover:bg-app-muted transition"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="h-9 px-4 grid place-items-center rounded-full btn-primary text-sm font-semibold transition"
              >
                Sign up
              </Link>
            </>
          )}

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden h-9 w-9 grid place-items-center rounded-full hover:bg-app-muted"
            aria-label="Menu"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-app bg-app-soft">
          <form onSubmit={onSearch} className="px-4 py-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-full bg-app-muted border border-app px-4 py-2 text-sm outline-none focus:border-primary"
            />
          </form>
          <nav className="flex flex-col px-2 pb-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm rounded-lg hover:bg-app-muted"
              >
                {l.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/upload"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm rounded-lg hover:bg-app-muted text-primary font-semibold"
              >
                + Upload video
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

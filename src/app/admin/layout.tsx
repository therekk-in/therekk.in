import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user || !user.isAdmin) {
    redirect("/admin");
  }
  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <aside className="hidden md:flex flex-col w-56 border-r border-app bg-card p-4 sticky top-16 h-[calc(100vh-4rem)]">
        <p className="text-xs text-app-muted uppercase tracking-wider mb-3">
          Admin
        </p>
        <nav className="flex flex-col gap-1">
          <AdminLink href="/admin/dashboard">Dashboard</AdminLink>
          <AdminLink href="/admin/users">Users</AdminLink>
          <AdminLink href="/admin/videos">Videos</AdminLink>
          <AdminLink href="/admin/posts">Posts</AdminLink>
          <AdminLink href="/admin/communities">Communities</AdminLink>
          <AdminLink href="/admin/reports">Reports</AdminLink>
          <AdminLink href="/admin/announcements">Announcements</AdminLink>
        </nav>
        <div className="mt-auto pt-3 border-t border-app">
          <Link
            href="/"
            className="block text-sm text-app-muted hover:text-app"
          >
            ← Back to site
          </Link>
        </div>
      </aside>
      <div className="md:hidden w-full bg-card border-b border-app p-2 flex gap-1 overflow-x-auto">
        <AdminLink href="/admin/dashboard">Dashboard</AdminLink>
        <AdminLink href="/admin/users">Users</AdminLink>
        <AdminLink href="/admin/videos">Videos</AdminLink>
        <AdminLink href="/admin/posts">Posts</AdminLink>
        <AdminLink href="/admin/communities">Communities</AdminLink>
        <AdminLink href="/admin/reports">Reports</AdminLink>
        <AdminLink href="/admin/announcements">Announcements</AdminLink>
      </div>
      <div className="flex-1 p-4 sm:p-6">{children}</div>
    </div>
  );
}

function AdminLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-app-muted transition whitespace-nowrap"
    >
      {children}
    </Link>
  );
}

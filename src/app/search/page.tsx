import Link from "next/link";
import { formatNumber, timeAgo } from "@/lib/utils";
import { VerifiedBadge } from "@/components/VideoCard";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    sort?: string;
    category?: string;
  }>;
}

const TABS = [
  { key: "all", label: "All" },
  { key: "videos", label: "Videos" },
  { key: "posts", label: "Posts" },
  { key: "communities", label: "Communities" },
  { key: "users", label: "Users" },
];

const SORTS: Record<string, Record<string, string>> = {
  videos: {
    relevance: "Latest",
    latest: "Latest",
    views: "Most viewed",
    likes: "Most liked",
  },
  posts: {
    relevance: "Latest",
    latest: "Latest",
    top: "Top",
    comments: "Most comments",
  },
  communities: {
    relevance: "Members",
    members: "Members",
    latest: "Newest",
  },
  users: {
    relevance: "Followers",
  },
  all: {
    relevance: "Latest",
  },
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const q = sp.q || "";
  const type = sp.type || "all";
  const sort = sp.sort || "relevance";
  const category = sp.category;

  const params = new URLSearchParams({ q, type, sort });
  if (category) params.set("category", category);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/search?${params}`,
    { cache: "no-store" }
  );
  const data = await res.json();

  const sortLabel = SORTS[type]?.[sort] || "Latest";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
      <h1 className="text-2xl sm:text-3xl font-black">
        {q ? (
          <>
            Search results for <span className="text-primary">"{q}"</span>
          </>
        ) : category ? (
          <>
            <span className="text-primary">{category}</span>
          </>
        ) : (
          "Explore"
        )}
      </h1>
      {category && (
        <p className="text-sm text-app-muted mt-1">Category filter applied</p>
      )}

      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-app scrollbar-hide">
        {TABS.map((t) => {
          const sp2 = new URLSearchParams({ q, type: t.key, sort });
          if (category) sp2.set("category", category);
          const active = type === t.key;
          return (
            <Link
              key={t.key}
              href={`/search?${sp2}`}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-app-muted hover:text-app"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-sm">
        <span className="text-app-muted">Sort:</span>
        <SortDropdown type={type} current={sort} q={q} category={category} />
      </div>

      <div className="mt-6 space-y-8">
        {(type === "all" || type === "videos") && (
          <Section title="Videos" total={data.videos?.length || 0}>
            {data.videos?.length === 0 ? (
              <p className="text-sm text-app-muted">No videos</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.videos?.map((v: any) => (
                  <VideoSearchCard key={v.id} v={v} />
                ))}
              </div>
            )}
          </Section>
        )}

        {(type === "all" || type === "posts") && (
          <Section title="Posts" total={data.posts?.length || 0}>
            {data.posts?.length === 0 ? (
              <p className="text-sm text-app-muted">No posts</p>
            ) : (
              <div className="space-y-3">
                {data.posts?.map((p: any) => (
                  <PostSearchCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </Section>
        )}

        {(type === "all" || type === "communities") && (
          <Section title="Communities" total={data.communities?.length || 0}>
            {data.communities?.length === 0 ? (
              <p className="text-sm text-app-muted">No communities</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.communities?.map((c: any) => (
                  <Link
                    key={c.id}
                    href={`/community/${c.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-app bg-card hover:border-primary/40 transition"
                  >
                    <div className="h-12 w-12 rounded-full bg-app-muted grid place-items-center text-xl shrink-0">
                      {c.profilePicture?.startsWith("http") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.profilePicture}
                          alt={c.name}
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : c.profilePicture ? (
                        <span>{c.profilePicture}</span>
                      ) : (
                        <span>👥</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">c/{c.name}</p>
                      <p className="text-xs text-app-muted truncate">
                        {formatNumber(c.membersCount)} members
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Section>
        )}

        {(type === "all" || type === "users") && (
          <Section title="Users" total={data.users?.length || 0}>
            {data.users?.length === 0 ? (
              <p className="text-sm text-app-muted">No users</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.users?.map((u: any) => (
                  <Link
                    key={u.id}
                    href={`/profile/${u.username}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-app bg-card hover:border-primary/40 transition"
                  >
                    <div className="h-12 w-12 rounded-full bg-app-muted grid place-items-center text-lg font-bold shrink-0">
                      {u.profilePicture?.startsWith("http") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.profilePicture}
                          alt={u.displayName}
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : u.profilePicture ? (
                        <span>{u.profilePicture}</span>
                      ) : (
                        <span>{u.displayName?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold flex items-center gap-1 truncate">
                        {u.displayName}
                        {u.isVerified && <VerifiedBadge />}
                      </p>
                      <p className="text-xs text-app-muted truncate">
                        @{u.username} · {formatNumber(u.followersCount)} followers
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  total,
  children,
}: {
  title: string;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-bold text-lg mb-3">
        {title}{" "}
        <span className="text-sm font-normal text-app-muted">({total})</span>
      </h2>
      {children}
    </section>
  );
}

function VideoSearchCard({ v }: { v: any }) {
  return (
    <Link
      href={`/video/${v.id}`}
      className="group block rounded-2xl overflow-hidden bg-card border border-app hover:border-primary/40 transition"
    >
      <div className="relative aspect-video bg-app-muted">
        {v.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={v.thumbnailUrl}
            alt={v.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-4xl">
            🎬
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary">
          {v.title}
        </h3>
        <p className="text-xs text-app-muted mt-1">
          {formatNumber(v.viewsCount)} views · {timeAgo(v.createdAt)}
        </p>
      </div>
    </Link>
  );
}

function PostSearchCard({ p }: { p: any }) {
  return (
    <Link
      href={`/post/${p.id}`}
      className="block rounded-2xl border border-app bg-card p-4 hover:border-primary/40 transition"
    >
      <h3 className="font-semibold line-clamp-2">{p.title}</h3>
      <p className="text-xs text-app-muted mt-1">
        {p.communityName && `c/${p.communityName} · `}
        u/{p.userUsername} · {timeAgo(p.createdAt)}
      </p>
      <p className="text-sm text-app-muted line-clamp-2 mt-1">{p.content}</p>
    </Link>
  );
}

function SortDropdown({
  type,
  current,
  q,
  category,
}: {
  type: string;
  current: string;
  q: string;
  category?: string;
}) {
  const options: Record<string, Record<string, string>> = {
    videos: {
      relevance: "Latest",
      views: "Most viewed",
      likes: "Most liked",
    },
    posts: {
      relevance: "Latest",
      top: "Top voted",
      comments: "Most comments",
    },
    communities: {
      relevance: "Members",
      latest: "Newest",
    },
    users: { relevance: "Followers" },
    all: { relevance: "Latest" },
  };
  const list = options[type] || options.all;
  return (
    <div className="flex gap-1.5 flex-wrap">
      {Object.entries(list).map(([k, l]) => {
        const sp2 = new URLSearchParams({ q, type, sort: k });
        if (category) sp2.set("category", category);
        return (
          <Link
            key={k}
            href={`/search?${sp2}`}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              current === k
                ? "bg-primary text-white"
                : "bg-app-muted hover:bg-app"
            }`}
          >
            {l}
          </Link>
        );
      })}
    </div>
  );
}

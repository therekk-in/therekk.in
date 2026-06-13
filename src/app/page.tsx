import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getHomepageData, getPersonalizedFeed } from "@/lib/data";
import { VideoCard } from "@/components/VideoCard";
import { PostCard } from "@/components/PostCard";
import CategoryBar from "@/components/CategoryBar";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();
  const { trendingVideos, trendingPosts, popularCommunities } =
    await getHomepageData();

  let forYouVideos: any[] = [];
  let forYouPosts: any[] = [];
  if (user) {
    const personalized = await getPersonalizedFeed(user.id);
    forYouVideos = personalized.feedVideos;
    forYouPosts = personalized.feedPosts;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <section className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#a83125] to-secondary text-white p-6 sm:p-10">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-semibold tracking-wide uppercase">
            Welcome to THEREKK
          </span>
          <h1 className="mt-3 text-3xl sm:text-5xl font-black leading-tight">
            Fix it. Share it. <br />
            Learn from the best.
          </h1>
          <p className="mt-3 text-white/85 text-sm sm:text-base max-w-lg">
            The home of DIY electronics repair. Watch tutorials, ask questions,
            and join a community of tinkerers.
          </p>
          <div className="mt-5 flex gap-3 flex-wrap">
            {!user && (
              <>
                <Link
                  href="/auth/signup"
                  className="h-11 px-6 rounded-full bg-white text-primary font-bold grid place-items-center hover:bg-white/90 transition"
                >
                  Get started
                </Link>
                <Link
                  href="/search"
                  className="h-11 px-6 rounded-full bg-white/10 hover:bg-white/20 font-semibold grid place-items-center transition"
                >
                  Explore
                </Link>
              </>
            )}
            {user && (
              <Link
                href="/upload"
                className="h-11 px-6 rounded-full bg-white text-primary font-bold grid place-items-center hover:bg-white/90 transition"
              >
                Upload a video
              </Link>
            )}
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 text-[18rem] opacity-10 select-none pointer-events-none">
          🔧
        </div>
      </section>

      <section className="mb-10">
        <CategoryBar />
      </section>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-10">
          {user && forYouVideos.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-black">
                  <span className="text-primary">For</span> You
                </h2>
                <Link
                  href="/search?sort=latest"
                  className="text-sm text-app-muted hover:text-app"
                >
                  See all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {forYouVideos.slice(0, 6).map((v) => (
                  <VideoCard key={v.id} v={v} />
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-black">
                <span className="text-primary">Trending</span> Videos
              </h2>
              <Link
                href="/search?type=videos&sort=views"
                className="text-sm text-app-muted hover:text-app"
              >
                See all →
              </Link>
            </div>
            {trendingVideos.length === 0 ? (
              <EmptyState
                icon="🎬"
                title="No videos yet"
                description="Be the first to share a repair video with the community."
                action={
                  user && (
                    <Link
                      href="/upload"
                      className="btn-primary px-5 h-10 rounded-full font-semibold inline-grid place-items-center"
                    >
                      Upload video
                    </Link>
                  )
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {trendingVideos.slice(0, 9).map((v) => (
                  <VideoCard key={v.id} v={v} />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-black">
                <span className="text-primary">Trending</span> Posts
              </h2>
              <Link
                href="/search?type=posts&sort=likes"
                className="text-sm text-app-muted hover:text-app"
              >
                See all →
              </Link>
            </div>
            {trendingPosts.length === 0 ? (
              <EmptyState
                icon="📝"
                title="No posts yet"
                description="Start a discussion or ask the community for help."
                action={
                  user && (
                    <Link
                      href="/create-post"
                      className="btn-primary px-5 h-10 rounded-full font-semibold inline-grid place-items-center"
                    >
                      Create post
                    </Link>
                  )
                }
              />
            ) : (
              <div className="space-y-3">
                {trendingPosts.slice(0, 6).map((p) => (
                  <PostCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-app bg-card p-5">
            <h3 className="font-bold text-lg mb-1">Popular communities</h3>
            <p className="text-xs text-app-muted mb-4">
              Join the conversation
            </p>
            {popularCommunities.length === 0 ? (
              <p className="text-sm text-app-muted py-4 text-center">
                No communities yet
              </p>
            ) : (
              <ul className="space-y-3">
                {popularCommunities.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/community/${c.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="h-10 w-10 rounded-full bg-app-muted grid place-items-center text-lg shrink-0">
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
                        <p className="text-sm font-semibold group-hover:text-primary truncate">
                          c/{c.name}
                        </p>
                        <p className="text-xs text-app-muted truncate">
                          {c.membersCount} members
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {user && (
              <Link
                href="/create-community"
                className="mt-4 block text-center w-full h-9 leading-9 rounded-full border border-app hover:border-primary text-sm font-semibold transition"
              >
                + Create community
              </Link>
            )}
          </div>

          <div className="rounded-2xl border border-app bg-card p-5">
            <h3 className="font-bold text-lg mb-1">Categories</h3>
            <p className="text-xs text-app-muted mb-4">Browse by topic</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <Link
                  key={c}
                  href={`/search?type=videos&category=${encodeURIComponent(c)}`}
                  className="px-2.5 py-1 rounded-full bg-app-muted hover:bg-primary/10 hover:text-primary text-xs font-medium transition"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-app bg-card p-5 text-center">
            <p className="text-3xl mb-2">🔔</p>
            <h3 className="font-bold">Stay updated</h3>
            <p className="text-xs text-app-muted mt-1 mb-3">
              Get notified about new videos and posts from communities you love.
            </p>
            {!user ? (
              <Link
                href="/auth/signup"
                className="block w-full h-9 leading-9 rounded-full btn-primary font-semibold text-sm"
              >
                Sign up free
              </Link>
            ) : (
              <Link
                href="/settings"
                className="block w-full h-9 leading-9 rounded-full border border-app hover:border-primary font-semibold text-sm"
              >
                Manage notifications
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-app bg-app-soft p-8 text-center">
      <div className="text-5xl mb-3">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-app-muted mt-1 mb-4 max-w-md mx-auto">
        {description}
      </p>
      {action}
    </div>
  );
}

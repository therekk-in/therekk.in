import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-3">🔧</div>
        <h1 className="text-3xl font-black">Page not found</h1>
        <p className="text-app-muted mt-2">
          Looks like that page is broken. Let's get you back on track.
        </p>
        <div className="mt-6 flex gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="h-11 px-6 rounded-full btn-primary font-semibold grid place-items-center"
          >
            Go home
          </Link>
          <Link
            href="/search"
            className="h-11 px-6 rounded-full border border-app hover:bg-app-muted font-semibold grid place-items-center"
          >
            Search
          </Link>
        </div>
      </div>
    </div>
  );
}

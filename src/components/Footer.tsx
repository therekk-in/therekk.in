import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-app bg-app-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-black text-sm">
              TX
            </div>
            <span className="text-xl font-black">
              <span className="text-primary">THERE</span>KK
            </span>
          </Link>
          <p className="mt-3 text-sm text-app-muted leading-relaxed">
            The community platform for DIY electronics repair. Share, learn,
            and fix together.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-app-muted">
            <li>
              <Link href="/search?type=videos" className="hover:text-app">
                Videos
              </Link>
            </li>
            <li>
              <Link href="/search?type=posts" className="hover:text-app">
                Posts
              </Link>
            </li>
            <li>
              <Link
                href="/search?type=communities"
                className="hover:text-app"
              >
                Communities
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-app">
                Search
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Account</h4>
          <ul className="space-y-2 text-sm text-app-muted">
            <li>
              <Link href="/auth/login" className="hover:text-app">
                Login
              </Link>
            </li>
            <li>
              <Link href="/auth/signup" className="hover:text-app">
                Sign up
              </Link>
            </li>
            <li>
              <Link href="/settings" className="hover:text-app">
                Settings
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-app-muted">
            <li>
              <Link href="/contact" className="hover:text-app">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/credits" className="hover:text-app">
                Credits
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-app">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="hover:text-app">
                Terms of service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-app">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 text-xs text-app-muted flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p>Made with care for the repair community.</p>
        </div>
      </div>
    </footer>
  );
}

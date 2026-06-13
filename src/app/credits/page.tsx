import { DEVELOPER_NAME, DEVELOPER_EMAIL, CREATOR_NAME } from "@/lib/constants";

export default function CreditsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl sm:text-4xl font-black">Credits</h1>
      <p className="text-app-muted mt-2">
        The people behind THEREKK
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-app bg-card p-6 text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 grid place-items-center text-3xl mx-auto mb-3">
            👨‍💻
          </div>
          <h2 className="text-xl font-bold">Developer</h2>
          <p className="text-lg font-black mt-1">{DEVELOPER_NAME}</p>
          <a
            href={`mailto:${DEVELOPER_EMAIL}`}
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            {DEVELOPER_EMAIL}
          </a>
          <p className="text-xs text-app-muted mt-3">
            Built the entire platform
          </p>
        </div>

        <div className="rounded-2xl border border-app bg-card p-6 text-center">
          <div className="h-20 w-20 rounded-full bg-secondary/10 grid place-items-center text-3xl mx-auto mb-3">
            💡
          </div>
          <h2 className="text-xl font-bold">Creator of Idea</h2>
          <p className="text-lg font-black mt-1">{CREATOR_NAME}</p>
          <p className="text-sm text-app-muted mt-1">& Digital Controller</p>
          <p className="text-xs text-app-muted mt-3">
            Conceived the concept and vision
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-app bg-card p-6">
        <h2 className="text-xl font-bold">About THEREKK</h2>
        <p className="text-sm text-app-muted mt-2 leading-relaxed">
          THEREKK is a community-driven platform for DIY electronics repair
          enthusiasts. We bring together tinkerers, repair professionals, and
          curious minds to share knowledge through videos, posts, and
          discussions. Whether you're fixing a phone screen, troubleshooting
          a TV, or restoring a vintage radio, there's a place for you here.
        </p>
      </div>
    </div>
  );
}

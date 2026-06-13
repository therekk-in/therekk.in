import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

const ICONS: Record<string, string> = {
  "Mobile Phones": "📱",
  Laptops: "💻",
  TVs: "📺",
  "Home Appliances": "🏠",
  Cameras: "📷",
  "Gaming Consoles": "🎮",
  "Audio Devices": "🎧",
  "Washing Machines": "🧺",
  Refrigerators: "🧊",
  "Air Conditioners": "❄️",
};

export default function CategoryBar() {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide">
      <div className="flex gap-2 sm:gap-3 min-w-max pb-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/search?type=videos&category=${encodeURIComponent(c)}`}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-card border border-app hover:border-primary hover:bg-primary/5 text-sm font-medium transition whitespace-nowrap"
          >
            <span>{ICONS[c]}</span>
            <span>{c}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

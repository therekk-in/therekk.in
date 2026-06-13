"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
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

export default function OnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const [picked, setPicked] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/auth/me");
      if (!r.ok) {
        router.replace("/auth/login");
        return;
      }
      setChecking(false);
    })();
  }, [router]);

  const toggle = (c: string) => {
    setPicked((p) =>
      p.includes(c) ? p.filter((x) => x !== c) : [...p, c]
    );
  };

  const submit = async () => {
    if (picked.length < 1) {
      toast.error("Pick at least one interest");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: picked }),
      });
      if (!res.ok) throw new Error("Could not save interests");
      toast.success("All set! Welcome to THEREKK.");
      router.push("/");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black">
            What do you like to <span className="text-primary">fix</span>?
          </h1>
          <p className="text-app-muted mt-2">
            Pick a few interests and we'll personalize your feed.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
          {CATEGORIES.map((c) => {
            const active = picked.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggle(c)}
                className={`p-4 rounded-2xl border-2 transition text-center ${
                  active
                    ? "border-primary bg-primary/10"
                    : "border-app bg-card hover:border-app-muted"
                }`}
              >
                <div className="text-3xl mb-2">{ICONS[c]}</div>
                <div className="text-xs sm:text-sm font-semibold">{c}</div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => router.push("/")}
            className="px-4 h-11 rounded-full text-sm text-app-muted hover:text-app"
          >
            Skip for now
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-8 h-11 rounded-full btn-primary font-semibold transition disabled:opacity-60"
          >
            {loading ? "Saving…" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

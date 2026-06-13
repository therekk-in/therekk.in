export const APP_NAME = "THEREKK";
export const APP_TAGLINE = "DIY Electronics Repair Community";
export const APP_DESCRIPTION =
  "A community of electronics repair enthusiasts sharing videos, guides, and discussions.";

export const CATEGORIES = [
  "Mobile Phones",
  "Laptops",
  "TVs",
  "Home Appliances",
  "Cameras",
  "Gaming Consoles",
  "Audio Devices",
  "Washing Machines",
  "Refrigerators",
  "Air Conditioners",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const REPORT_REASONS = [
  "Spam",
  "Inappropriate content",
  "Misinformation",
  "Harassment",
  "Other",
] as const;

export const EMOJI_AVATARS = [
  "🛠️",
  "🔧",
  "⚡",
  "💡",
  "🔌",
  "📱",
  "💻",
  "📺",
  "📷",
  "🎮",
  "🎧",
  "🧰",
  "⚙️",
  "🔋",
  "🧲",
  "🔦",
  "🪛",
  "🪚",
  "👨‍🔧",
  "👩‍🔧",
];

export const CONTACT_EMAIL = "therekk.in@gmail.com";
export const CONTACT_PHONE = "+91 9539213484";
export const DEVELOPER_EMAIL = "yasirnc678@gmail.com";
export const DEVELOPER_NAME = "YASIR N";
export const CREATOR_NAME = "SANIN T";

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

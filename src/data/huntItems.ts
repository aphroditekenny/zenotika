// Centralized scavenger hunt item definitions for shared progress calculations.
// Extracted from HomePage.tsx to enable unified progress tracking in the Header
// and other components without importing the heavy HomePage module.

export interface HuntItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  initiallyCollected?: boolean;
}

export const HUNT_ITEMS: HuntItem[] = [
  {
    id: "crab",
    name: "Crab",
    description: "Spotted near the footer tidepools.",
    icon: "/ZENO-05.svg",
    initiallyCollected: true,
  },
  {
    id: "gem",
    name: "Gem",
    description: "Prismatic shard embedded in the header glow.",
    icon: "/ZENO-08.svg",
    initiallyCollected: true,
  },
  {
    id: "coin",
    name: "Coin",
    description: "Found orbiting the Zen progress capsule.",
    icon: "/share.svg",
    initiallyCollected: false,
  },
  {
    id: "book",
    name: "Book",
    description: "Hidden within the log book archives.",
    icon: "/share.png",
  },
  {
    id: "chick",
    name: "Chick",
    description: "Peeks out when accessibility tools are enabled.",
    icon: "/pwa-192x192.png",
  },
  {
    id: "key",
    name: "Key",
    description: "Rumoured to unlock the upcoming Rooms release.",
    icon: "/pwa-512x512-maskable.png",
  },
];

export const HUNT_STORAGE_KEY = "zenotika-hunt-progress";
export const DEFAULT_COLLECTED_IDS = HUNT_ITEMS.filter((item) => item.initiallyCollected).map((item) => item.id);

// Custom event name dispatched whenever hunt progress mutates.
export const HUNT_PROGRESS_EVENT = "zen:hunt-progress";

export interface HuntProgressDetail { collected: string[]; }

// Ensure the file is treated as a module even if tree-shaken.
export const __HUNT_ITEMS_VERSION__ = 1 as const;

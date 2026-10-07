import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * First letters of each word, uppercase, capped at two: the fallback shown
 * inside avatar/logo tiles when no image exists. `fallback` covers empty
 * names (users render "U", agencies render "A").
 */
export function getInitials(name: string, fallback = "U"): string {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || fallback
  );
}

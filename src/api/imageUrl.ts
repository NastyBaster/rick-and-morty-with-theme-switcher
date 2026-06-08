import { API_BASE } from "./config";

const API_ORIGIN = "https://rickandmortyapi.com/api";

export const IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%231e293b' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='14' font-family='sans-serif'%3ENo image%3C/text%3E%3C/svg%3E";

export function toProxiedImageUrl(url: string): string {
  if (url.startsWith(API_ORIGIN)) {
    return url.replace(API_ORIGIN, API_BASE);
  }
  return url;
}

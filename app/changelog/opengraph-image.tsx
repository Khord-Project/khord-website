import { ogImage, size, contentType } from "../_og/og-image";

export { size, contentType };
export const alt = "Khord — Changelog";

export default function Image() {
  return ogImage("Changelog", "Release history");
}

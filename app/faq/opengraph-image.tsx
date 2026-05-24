import { ogImage, size, contentType } from "../_og/og-image";

export { size, contentType };
export const alt = "Khord — Frequently asked questions";

export default function Image() {
  return ogImage("FAQ", "Frequently asked questions");
}

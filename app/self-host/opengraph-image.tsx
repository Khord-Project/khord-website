import { ogImage, size, contentType } from "../_og/og-image";

export { size, contentType };
export const alt = "Khord — Self-Hosting Guide";

export default function Image() {
  return ogImage("Self-Hosting", "Self-Hosting Guide");
}

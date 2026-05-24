import { ogImage, size, contentType } from "../_og/og-image";

export { size, contentType };
export const alt = "Khord — Blog";

export default function Image() {
  return ogImage("Blog", "Notes from building Khord");
}

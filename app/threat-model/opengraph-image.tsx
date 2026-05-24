import { ogImage, size, contentType } from "../_og/og-image";

export { size, contentType };
export const alt = "Khord — Threat Model";

export default function Image() {
  return ogImage("Transparency", "Threat Model");
}

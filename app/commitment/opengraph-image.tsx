import { ogImage, size, contentType } from "../_og/og-image";

export { size, contentType };
export const alt = "Khord — Data Processing Commitment";

export default function Image() {
  return ogImage("Transparency", "Data Processing Commitment");
}

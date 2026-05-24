import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const OG_DIR = join(process.cwd(), "app", "_og");

async function logoDataUrl(): Promise<string> {
  const buf = await readFile(join(process.cwd(), "public", "logo.png"));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

export async function ogImage(eyebrow: string, title: string) {
  const [fontData, logo] = await Promise.all([
    readFile(join(OG_DIR, "DMSerifDisplay-Regular.ttf")),
    logoDataUrl(),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#0A0F0F",
          backgroundImage:
            "radial-gradient(circle at 78% 18%, rgba(58,175,191,0.16) 0%, transparent 45%), radial-gradient(circle at 12% 92%, rgba(244,162,97,0.12) 0%, transparent 45%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            width={56}
            height={56}
            style={{ borderRadius: "9999px" }}
            alt=""
          />
          <span
            style={{
              fontFamily: "DM Serif Display",
              fontSize: "34px",
              color: "#E8EDED",
              letterSpacing: "0.02em",
            }}
          >
            Khord
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <span
            style={{
              fontFamily: "DM Serif Display",
              fontSize: "22px",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "#3AAFBF",
            }}
          >
            {eyebrow}
          </span>
          <span
            style={{
              fontFamily: "DM Serif Display",
              fontSize: title.length > 48 ? "60px" : "76px",
              lineHeight: 1.08,
              color: "#E8EDED",
            }}
          >
            {title}
          </span>
        </div>

        <span
          style={{
            fontFamily: "DM Serif Display",
            fontSize: "26px",
            color: "#5E7676",
          }}
        >
          khord.org
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "DM Serif Display",
          data: fontData,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );
}

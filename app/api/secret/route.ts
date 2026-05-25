import { NextRequest, NextResponse } from "next/server";
import { storeSecret, cleanupExpired } from "@/lib/secrets";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

// Naive in-memory sliding-window rate limit. Per server instance and reset on
// restart — enough to blunt casual abuse for an anonymous, write-only endpoint.
const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: corsHeaders },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: corsHeaders },
    );
  }

  const { ciphertext, nonce } = (body ?? {}) as {
    ciphertext?: unknown;
    nonce?: unknown;
  };

  if (
    typeof ciphertext !== "string" ||
    typeof nonce !== "string" ||
    !ciphertext ||
    !nonce
  ) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400, headers: corsHeaders },
    );
  }

  if (ciphertext.length > 10000 || nonce.length > 100) {
    return NextResponse.json(
      { error: "Too large" },
      { status: 413, headers: corsHeaders },
    );
  }

  // Opportunistic TTL sweep — fire and forget.
  cleanupExpired().catch(() => {});

  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  try {
    await storeSecret(id, { ciphertext, nonce, created_at: Date.now() });
  } catch {
    return NextResponse.json(
      { error: "Storage error" },
      { status: 500, headers: corsHeaders },
    );
  }

  return NextResponse.json({ id }, { status: 201, headers: corsHeaders });
}

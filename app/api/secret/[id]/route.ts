import { NextRequest, NextResponse } from "next/server";
import { claimSecret } from "@/lib/secrets";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

// Matches the 16-char hex id we generate. Also guards against path traversal,
// since the id is used to build a filename.
const ID_RE = /^[a-f0-9]{16}$/;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!ID_RE.test(id)) {
    return NextResponse.json(
      { error: "expired" },
      { status: 404, headers: corsHeaders },
    );
  }

  const secret = await claimSecret(id);
  if (!secret) {
    return NextResponse.json(
      { error: "expired" },
      { status: 404, headers: corsHeaders },
    );
  }

  return NextResponse.json(
    { ciphertext: secret.ciphertext, nonce: secret.nonce },
    { status: 200, headers: corsHeaders },
  );
}

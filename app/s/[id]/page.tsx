"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type State =
  | { kind: "loading" }
  | { kind: "expired" }
  | { kind: "error"; message: string }
  | { kind: "ready"; contact: string };

// Tolerant base64 decoder — accepts both standard and URL-safe alphabets, with
// or without padding. The fragment key is base64url; the JSON nonce/ciphertext
// are standard base64.
function b64ToBytes(input: string): ArrayBuffer {
  const s = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s + pad);
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return buf;
}

// Module-scoped, keyed by id: a single load runs per page session regardless of
// how many times the effect mounts (React StrictMode invokes effects twice in
// dev, and consuming a one-time secret twice would destroy it before display).
const loads = new Map<string, Promise<State>>();

async function loadSecret(id: string): Promise<State> {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return {
      kind: "error",
      message:
        "Decryption needs a secure context. Open this link over HTTPS (or localhost), not a plain-http address.",
    };
  }

  const keyMaterial = window.location.hash.slice(1);
  if (!keyMaterial) {
    return {
      kind: "error",
      message: "This link is missing its decryption key.",
    };
  }

  let res: Response;
  try {
    res = await fetch(`/api/secret/${id}`, { cache: "no-store" });
  } catch {
    return {
      kind: "error",
      message: "Couldn't reach the server. Check your connection.",
    };
  }

  if (res.status === 404) return { kind: "expired" };
  if (!res.ok) return { kind: "error", message: "Something went wrong." };

  try {
    const { ciphertext, nonce } = (await res.json()) as {
      ciphertext: string;
      nonce: string;
    };
    const key = await crypto.subtle.importKey(
      "raw",
      b64ToBytes(keyMaterial),
      "AES-GCM",
      false,
      ["decrypt"],
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: b64ToBytes(nonce) },
      key,
      b64ToBytes(ciphertext),
    );
    return { kind: "ready", contact: new TextDecoder().decode(decrypted) };
  } catch {
    return {
      kind: "error",
      message: "Could not decrypt this link. The key may be incorrect.",
    };
  }
}

export default function SecretViewer() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [state, setState] = useState<State>({ kind: "loading" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    let load = loads.get(id);
    if (!load) {
      load = loadSecret(id);
      loads.set(id, load);
    }
    load.then((result) => {
      if (active) setState(result);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const copy = async () => {
    if (state.kind !== "ready") return;
    try {
      await navigator.clipboard.writeText(state.contact);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — user can select manually */
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-bg px-6 py-16 text-fg">
      <Link href="/" className="mb-10 flex items-center gap-2.5">
        <Image
          src="/logo.png"
          alt="Khord logo"
          width={32}
          height={32}
          priority
          className="h-8 w-8 rounded-full"
        />
        <span className="font-serif text-xl tracking-wide text-fg">Khord</span>
      </Link>

      <div className="w-full max-w-[520px] rounded-2xl border border-border bg-surface p-8">
        {state.kind === "loading" && (
          <div className="flex flex-col items-center py-6 text-center">
            <div
              aria-hidden
              className="mb-4 h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary-glow"
            />
            <p className="text-sm text-fg-muted">Retrieving…</p>
          </div>
        )}

        {state.kind === "expired" && (
          <div className="py-4 text-center">
            <h1 className="mb-2 font-serif text-[26px] font-normal text-fg">
              Link expired
            </h1>
            <p className="text-[15px] leading-[1.6] text-fg-muted">
              This link has already been used or has expired. One-time links can
              be opened only once.
            </p>
          </div>
        )}

        {state.kind === "error" && (
          <div className="py-4 text-center">
            <h1 className="mb-2 font-serif text-[26px] font-normal text-fg">
              Can&apos;t open this link
            </h1>
            <p className="text-[15px] leading-[1.6] text-fg-muted">
              {state.message}
            </p>
          </div>
        )}

        {state.kind === "ready" && (
          <div>
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-primary-glow">
              Shared contact
            </p>
            <h1 className="mb-5 font-serif text-[26px] font-normal leading-snug text-fg">
              Someone shared their Khord contact with you
            </h1>

            <div className="rounded-xl border border-border-subtle bg-bg-subtle px-4 py-3">
              <code className="block break-all font-mono text-[13px] leading-[1.5] text-fg-muted select-all">
                {state.contact}
              </code>
            </div>

            <button
              type="button"
              onClick={copy}
              className="mt-4 w-full rounded-[10px] bg-gradient-to-br from-primary to-primary-light px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_#1A535C60]"
            >
              {copied ? "Copied ✓" : "Copy to clipboard"}
            </button>

            <div className="mt-6 rounded-xl border border-border-subtle bg-bg-subtle px-4 py-3.5">
              <p className="text-[13px] font-medium text-fg">
                Open Khord → tap <span className="text-accent">+</span> → paste
                this link.
              </p>
            </div>

            <p className="mt-5 text-[13px] leading-[1.6] text-accent">
              This link has been destroyed. It cannot be viewed again.
            </p>
            <p className="mt-3 text-[12px] leading-[1.6] text-fg-dim">
              The encryption key was in the URL fragment — it never reached our
              server. The server stored only encrypted data and has now deleted
              it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

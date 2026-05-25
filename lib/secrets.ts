import "server-only";

import {
  mkdir,
  writeFile,
  readFile,
  rename,
  unlink,
  readdir,
  stat,
} from "node:fs/promises";
import { join } from "node:path";

// Ephemeral, zero-knowledge store for one-time contact-exchange secrets.
// The server only ever holds opaque {ciphertext, nonce} — the encryption key
// lives in the URL fragment and never reaches us. Secrets are deleted on first
// read (atomic claim via rename) or after the TTL, whichever comes first.

const DATA_DIR = join(process.cwd(), "data", "secrets");
export const TTL_MS = 24 * 60 * 60 * 1000;

export type SecretRecord = {
  ciphertext: string;
  nonce: string;
  created_at: number;
};

function pathFor(id: string): string {
  return join(DATA_DIR, `${id}.json`);
}

async function ensureDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function storeSecret(
  id: string,
  record: SecretRecord,
): Promise<void> {
  await ensureDir();
  // "wx" fails if a file with this id already exists (collision guard).
  await writeFile(pathFor(id), JSON.stringify(record), { flag: "wx" });
}

// Atomically claims and returns a secret, or null if it does not exist, was
// already claimed, or has expired. The rename is the atomicity primitive: only
// one concurrent reader can win it, guaranteeing true one-time semantics.
export async function claimSecret(id: string): Promise<SecretRecord | null> {
  await ensureDir();
  const claimed = join(
    DATA_DIR,
    `${id}.${process.pid}.${Date.now()}.claim`,
  );
  try {
    await rename(pathFor(id), claimed);
  } catch {
    return null;
  }
  try {
    const raw = await readFile(claimed, "utf8");
    const record = JSON.parse(raw) as SecretRecord;
    if (Date.now() - record.created_at > TTL_MS) return null;
    return record;
  } catch {
    return null;
  } finally {
    await unlink(claimed).catch(() => {});
  }
}

// Best-effort sweep of expired secrets and stale claim files. Called
// opportunistically on writes; no external cron required.
export async function cleanupExpired(): Promise<void> {
  let files: string[];
  try {
    files = await readdir(DATA_DIR);
  } catch {
    return;
  }
  const now = Date.now();
  await Promise.all(
    files.map(async (file) => {
      const p = join(DATA_DIR, file);
      try {
        const s = await stat(p);
        const maxAge = file.endsWith(".json") ? TTL_MS : 60_000;
        if (now - s.mtimeMs > maxAge) await unlink(p);
      } catch {
        // file vanished under us — fine
      }
    }),
  );
}

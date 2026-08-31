import { createHmac, randomBytes, timingSafeEqual } from "crypto";

// Stateless sign-in challenge. The server issues a human-readable message that
// embeds the address, a nonce, and an expiry, plus an HMAC so the server can
// later confirm it issued that exact message - no session store required.

const CHALLENGE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function secret(): string {
  return process.env.AUTH_SECRET || "streamgo-dev-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export interface Challenge {
  message: string;
}

export function createChallenge(address: string): Challenge {
  const addr = address.toLowerCase();
  const nonce = randomBytes(16).toString("hex");
  const issuedAt = Date.now();
  const expiresAt = issuedAt + CHALLENGE_TTL_MS;

  // The signed portion is the part the wallet signs and we can re-verify.
  const payload = `${addr}|${nonce}|${issuedAt}|${expiresAt}`;
  const mac = sign(payload);

  const message = [
    "StreamGo wants you to sign in with your RobinHood Chain wallet.",
    "",
    `Address: ${addr}`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date(issuedAt).toISOString()}`,
    `Expires At: ${new Date(expiresAt).toISOString()}`,
    `Auth: ${mac}`,
  ].join("\n");

  return { message };
}

export interface VerifiedChallenge {
  ok: boolean;
  address?: string;
  reason?: string;
}

function field(message: string, label: string): string | null {
  const m = message.match(new RegExp(`^${label}: (.+)$`, "m"));
  return m ? m[1].trim() : null;
}

/** Re-derive and validate a challenge message the client is presenting back. */
export function verifyChallenge(message: string): VerifiedChallenge {
  const addr = field(message, "Address");
  const nonce = field(message, "Nonce");
  const issuedAtStr = field(message, "Issued At");
  const expiresAtStr = field(message, "Expires At");
  const mac = field(message, "Auth");

  if (!addr || !nonce || !issuedAtStr || !expiresAtStr || !mac) {
    return { ok: false, reason: "Malformed challenge" };
  }

  const issuedAt = Date.parse(issuedAtStr);
  const expiresAt = Date.parse(expiresAtStr);
  if (Number.isNaN(issuedAt) || Number.isNaN(expiresAt)) {
    return { ok: false, reason: "Bad timestamps" };
  }
  if (Date.now() > expiresAt) {
    return { ok: false, reason: "Challenge expired" };
  }

  const payload = `${addr}|${nonce}|${issuedAt}|${expiresAt}`;
  const expected = sign(payload);

  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "Invalid challenge signature" };
  }

  return { ok: true, address: addr };
}

import { recoverMessageAddress } from "viem";
import { verifyChallenge } from "./authChallenge";

/** Verify that `address` really signed our sign-in challenge. */
export async function verifyOwnership(
  address: string,
  message?: string,
  signature?: `0x${string}`
): Promise<{ ok: boolean; reason?: string }> {
  if (!message || !signature) {
    return { ok: false, reason: "Missing signature." };
  }

  // 1. The challenge must be one we issued and still valid.
  const challenge = verifyChallenge(message);
  if (!challenge.ok || !challenge.address) {
    return { ok: false, reason: challenge.reason ?? "Invalid challenge." };
  }
  if (challenge.address.toLowerCase() !== address.toLowerCase()) {
    return { ok: false, reason: "Challenge address mismatch." };
  }

  // 2. The signature must recover to the claimed address.
  try {
    const recovered = await recoverMessageAddress({ message, signature });
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return { ok: false, reason: "Signature does not match address." };
    }
  } catch {
    return { ok: false, reason: "Could not verify signature." };
  }

  return { ok: true };
}

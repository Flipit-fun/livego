"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { coins as demoCoins, type Coin } from "@/lib/data";
import {
  hasInjectedWallet,
  requestAccounts,
  personalSign,
  ensureChain,
} from "@/lib/eip1193";

export interface AuthProof {
  address: string;
  message: string;
  signature: string;
  demo: boolean;
}

type Status = "disconnected" | "connecting" | "connected";

interface WalletContextValue {
  status: Status;
  connected: boolean;
  /** Full account address, used as the LiveKit participant identity. */
  address: string | null;
  /** Shortened form for display, e.g. 0x4f2c…9ce1 */
  short: string | null;
  /** True when connected without an injected wallet (no signature). */
  isDemo: boolean;
  /** Signed ownership proof to present to the server, or null in demo mode. */
  auth: AuthProof | null;
  /** Holdings that back the room list. */
  coins: Coin[];
  coinsLoading: boolean;
  error: string | null;
  connect: () => Promise<string | null>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const ADDR_KEY = "livego.wallet.address";
const PROOF_KEY = "livego.wallet.proof";

function randomAddress(): string {
  const hex = "0123456789abcdef";
  let out = "0x";
  for (let i = 0; i < 40; i++) out += hex[(Math.random() * 16) | 0];
  return out;
}

export function shortenAddress(addr: string): string {
  if (!addr.startsWith("0x") || addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const ALLOW_DEMO = process.env.NEXT_PUBLIC_ALLOW_DEMO !== "false";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("disconnected");
  const [address, setAddress] = useState<string | null>(null);
  const [auth, setAuth] = useState<AuthProof | null>(null);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [coinsLoading, setCoinsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoins = useCallback(async (addr: string) => {
    setCoinsLoading(true);
    try {
      const res = await fetch(
        `/api/wallet/coins?address=${encodeURIComponent(addr)}`
      );
      const data = await res.json();
      setCoins(Array.isArray(data.coins) ? data.coins : demoCoins);
    } catch {
      setCoins(demoCoins);
    } finally {
      setCoinsLoading(false);
    }
  }, []);

  // Restore a previous session (no re-signing — the challenge is valid for 24h).
  useEffect(() => {
    const storedAddr = window.localStorage.getItem(ADDR_KEY);
    if (!storedAddr) return;
    const storedProof = window.localStorage.getItem(PROOF_KEY);
    setAddress(storedAddr);
    if (storedProof) {
      try {
        setAuth(JSON.parse(storedProof) as AuthProof);
      } catch {
        /* ignore corrupt proof */
      }
    }
    setStatus("connected");
    fetchCoins(storedAddr);
  }, [fetchCoins]);

  const connect = useCallback(async (): Promise<string | null> => {
    setError(null);
    setStatus("connecting");
    try {
      let proof: AuthProof;

      if (hasInjectedWallet()) {
        // Real wallet: request the account, make sure we're on RobinHood Chain,
        // then prove ownership by signing a server-issued challenge.
        const accounts = await requestAccounts();
        const addr = accounts[0];
        if (!addr) throw new Error("No account returned by wallet");
        await ensureChain();

        const res = await fetch("/api/auth/challenge", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ address: addr }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to get challenge");

        const signature = await personalSign(addr, data.message);
        proof = { address: addr, message: data.message, signature, demo: false };
      } else if (ALLOW_DEMO) {
        // No injected wallet — fall back to a stable demo identity so the app
        // is still usable. The server allows demo identities unless
        // LIVEKIT_ALLOW_DEMO=false.
        const existing = window.localStorage.getItem(ADDR_KEY);
        const addr = existing || randomAddress();
        proof = { address: addr, message: "", signature: "", demo: true };
      } else {
        throw new Error(
          "No RobinHood Chain wallet found. Install an EVM wallet (e.g. MetaMask) to continue."
        );
      }

      window.localStorage.setItem(ADDR_KEY, proof.address);
      window.localStorage.setItem(PROOF_KEY, JSON.stringify(proof));
      setAddress(proof.address);
      setAuth(proof);
      setStatus("connected");
      fetchCoins(proof.address);
      return proof.address;
    } catch (err) {
      setStatus("disconnected");
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
      return null;
    }
  }, [fetchCoins]);

  const disconnect = useCallback(() => {
    window.localStorage.removeItem(ADDR_KEY);
    window.localStorage.removeItem(PROOF_KEY);
    setAddress(null);
    setAuth(null);
    setCoins([]);
    setStatus("disconnected");
  }, []);

  // Poll holdings so live/viewer status stays fresh while connected.
  useEffect(() => {
    if (status !== "connected" || !address) return;
    const id = setInterval(() => fetchCoins(address), 12000);
    return () => clearInterval(id);
  }, [status, address, fetchCoins]);

  return (
    <WalletContext.Provider
      value={{
        status,
        connected: status === "connected",
        address,
        short: address ? shortenAddress(address) : null,
        isDemo: auth?.demo ?? false,
        auth,
        coins,
        coinsLoading,
        error,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

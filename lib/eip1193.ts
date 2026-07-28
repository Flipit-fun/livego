"use client";

import { chain } from "./chain";

// Minimal typing for an injected EIP-1193 provider (MetaMask, etc.).
interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export function getProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null;
  return window.ethereum ?? null;
}

export function hasInjectedWallet(): boolean {
  return getProvider() !== null;
}

export async function requestAccounts(): Promise<string[]> {
  const provider = getProvider();
  if (!provider) throw new Error("No wallet found");
  const accounts = (await provider.request({
    method: "eth_requestAccounts",
  })) as string[];
  return accounts;
}

export async function personalSign(address: string, message: string): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error("No wallet found");
  const signature = (await provider.request({
    method: "personal_sign",
    params: [message, address],
  })) as string;
  return signature;
}

// Pull a numeric provider error code out of the various shapes wallets use.
function errorCode(err: unknown): number | undefined {
  const e = err as {
    code?: number;
    data?: { originalError?: { code?: number } };
  };
  return e?.code ?? e?.data?.originalError?.code;
}

async function addChain(provider: Eip1193Provider): Promise<void> {
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: chain.hexId,
        chainName: chain.name,
        rpcUrls: [chain.rpcUrl],
        nativeCurrency: {
          name: chain.nativeSymbol,
          symbol: chain.nativeSymbol,
          decimals: 18,
        },
        blockExplorerUrls: chain.explorerUrl ? [chain.explorerUrl] : undefined,
      },
    ],
  });
}

/**
 * Ask the wallet to switch to RobinHood Chain, adding it first if it isn't
 * known to the wallet yet.
 */
export async function ensureChain(): Promise<void> {
  const provider = getProvider();
  if (!provider) return;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chain.hexId }],
    });
  } catch (err: unknown) {
    const code = errorCode(err);
    // 4902 (and some wallets: -32603 wrapping 4902) = chain not added yet.
    if (code === 4902 || code === -32603) {
      try {
        await addChain(provider);
      } catch {
        // user declined adding the network — stay on the current chain
      }
    }
    // 4001 = user rejected the switch; anything else we also tolerate and
    // continue on whatever chain they're on.
  }
}

/** The chain id the wallet is currently on, as a decimal number. */
export async function getChainId(): Promise<number | null> {
  const provider = getProvider();
  if (!provider) return null;
  try {
    const hex = (await provider.request({ method: "eth_chainId" })) as string;
    return parseInt(hex, 16);
  } catch {
    return null;
  }
}

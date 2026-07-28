// Chain configuration for RobinHood Chain — an Arbitrum-Orbit EVM L2 that uses
// ETH for gas (mainnet chain id 4663, testnet 46630). Defaults below are the
// real public network values so the wallet can switch networks with no extra
// setup; every field can still be overridden via env.

interface ChainDefaults {
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  symbol: string;
}

const NETWORKS: Record<"mainnet" | "testnet", ChainDefaults> = {
  mainnet: {
    id: 4663,
    name: "RobinHood Chain",
    rpcUrl: "https://rpc.mainnet.chain.robinhood.com",
    explorerUrl: "https://robinhoodchain.blockscout.com",
    symbol: "ETH",
  },
  testnet: {
    id: 46630,
    name: "RobinHood Chain Testnet",
    rpcUrl: "https://rpc.testnet.chain.robinhood.com",
    explorerUrl: "https://explorer.testnet.chain.robinhood.com",
    symbol: "ETH",
  },
};

const defaults =
  process.env.NEXT_PUBLIC_CHAIN_ENV === "testnet"
    ? NETWORKS.testnet
    : NETWORKS.mainnet;

export interface ChainConfig {
  /** decimal chain id */
  id: number;
  /** 0x-prefixed hex chain id for wallet_switchEthereumChain */
  hexId: string;
  name: string;
  rpcUrl: string;
  explorerUrl: string | null;
  nativeSymbol: string;
}

export const chain: ChainConfig = (() => {
  const id = process.env.NEXT_PUBLIC_CHAIN_ID
    ? Number(process.env.NEXT_PUBLIC_CHAIN_ID)
    : defaults.id;
  return {
    id,
    hexId: "0x" + id.toString(16),
    name: process.env.NEXT_PUBLIC_CHAIN_NAME || defaults.name,
    rpcUrl: process.env.NEXT_PUBLIC_CHAIN_RPC_URL || defaults.rpcUrl,
    explorerUrl: process.env.NEXT_PUBLIC_CHAIN_EXPLORER_URL || defaults.explorerUrl,
    nativeSymbol: process.env.NEXT_PUBLIC_CHAIN_SYMBOL || defaults.symbol,
  };
})();

export interface TokenMeta {
  /** ticker symbol used as the room name, e.g. HOOD */
  symbol: string;
  /** display name */
  name: string;
  /** ERC-20 contract address on RobinHood Chain */
  address: `0x${string}`;
  decimals: number;
  /** creator/dev address allowed to host this coin's room */
  dev?: string;
}

// The set of tokens Livego knows how to surface as rooms. Populate with real
// RobinHood Chain contract addresses to enable on-chain balance reading. When
// empty the app falls back to demo holdings.
export const TOKEN_REGISTRY: TokenMeta[] = [];

export function isChainConfigured(): boolean {
  return TOKEN_REGISTRY.length > 0 && !!chain.rpcUrl;
}

// Pons LaunchFactory integration for Livego.
// Users launch tokens through our UI, which calls the factory directly.
// We record the resulting token address in Supabase so only Livego-launched
// tokens appear in our directory.

export const PONS_FACTORY = "0xA5aAb3F0c6EeadF30Ef1D3Eb997108E976351feB" as const;
export const PONS_LEGACY_FACTORY = "0x0c37a24F5D23A486FA692d1500881d698B1F77a4" as const;
export const WETH = "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73" as const;
export const LAUNCH_FEE = "0.0005"; // ETH

// The factory's launch function ABI (from the docs / contract).
// The factory deploys the token + pool in one tx and emits TokenLaunched.
export const FACTORY_ABI = [
  {
    name: "launch",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "logo", type: "string" },
      { name: "description", type: "string" },
      { name: "twitter", type: "string" },
      { name: "telegram", type: "string" },
      { name: "discord", type: "string" },
      { name: "website", type: "string" },
      { name: "farcaster", type: "string" },
      { name: "initialBuyAmount", type: "uint256" },
    ],
    outputs: [{ name: "token", type: "address" }],
  },
  {
    name: "TokenLaunched",
    type: "event",
    inputs: [
      { name: "token", type: "address", indexed: true },
      { name: "deployer", type: "address", indexed: true },
      { name: "dexFactory", type: "address", indexed: true },
      { name: "pairToken", type: "address", indexed: false },
      { name: "pool", type: "address", indexed: false },
      { name: "dexId", type: "uint256", indexed: false },
      { name: "launchConfigId", type: "uint256", indexed: false },
      { name: "positionId", type: "uint256", indexed: false },
      { name: "restrictionsEndBlock", type: "uint256", indexed: false },
      { name: "initialBuyAmount", type: "uint256", indexed: false },
    ],
  },
] as const;

// Token contract ABI for reading metadata
export const TOKEN_ABI = [
  { name: "name", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "symbol", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "logo", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "description", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "liquidityPool", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { name: "socials", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "twitter", type: "string" }, { name: "telegram", type: "string" }, { name: "discord", type: "string" }, { name: "website", type: "string" }, { name: "farcaster", type: "string" }] },
] as const;

// Pons LaunchFactory integration for Livego.
// Users launch tokens through our UI, which calls the factory directly.
// We record the resulting token address in Supabase so only Livego-launched
// tokens appear in our directory.

export const PONS_FACTORY = "0xA5aAb3F0c6EeadF30Ef1D3Eb997108E976351feB" as const;
export const PONS_LEGACY_FACTORY = "0x0c37a24F5D23A486FA692d1500881d698B1F77a4" as const;
export const WETH = "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73" as const;
export const LAUNCH_FEE = "0.0005"; // ETH on RobinHood Chain
export const LAUNCH_CONFIG_ID = 0n;
export const DEX_ID = 0n;

// The real factory ABI from the verified contract on Blockscout.
// launchToken(TokenParams params, uint256 launchConfigId, uint256 dexId, bytes32 salt)
export const FACTORY_ABI = [
  {
    name: "launchToken",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "symbol", type: "string" },
          { name: "logo", type: "string" },
          { name: "description", type: "string" },
          {
            name: "socials",
            type: "tuple",
            components: [
              { name: "twitter", type: "string" },
              { name: "telegram", type: "string" },
              { name: "discord", type: "string" },
              { name: "website", type: "string" },
              { name: "farcaster", type: "string" },
            ],
          },
          { name: "feeWallet", type: "address" },
        ],
      },
      { name: "launchConfigId", type: "uint256" },
      { name: "dexId", type: "uint256" },
      { name: "salt", type: "bytes32" },
    ],
    outputs: [{ name: "token", type: "address" }],
  },
] as const;

// TokenLaunched event topic0
export const TOKEN_LAUNCHED_TOPIC =
  "0xdb51ea9ad51ab453a65a4cb7e60c3cb378c9501bb002609f8f97778fb6c4235a";

// Token contract ABI for reading metadata
export const TOKEN_ABI = [
  { name: "name", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "symbol", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "logo", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "description", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "liquidityPool", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { name: "socials", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "twitter", type: "string" }, { name: "telegram", type: "string" }, { name: "discord", type: "string" }, { name: "website", type: "string" }, { name: "farcaster", type: "string" }] },
] as const;

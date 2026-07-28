# Livego

Livego is a live streaming platform where **the token itself is the channel**. A
user connects their RobinHood Chain wallet, Livego reads their balances, and every
coin they hold becomes a room they can either join (if someone is broadcasting) or
open themselves. Going live is one press: the host can talk, turn on the camera,
share their screen to put a chart or contract in front of the room, and pull holders
from chat up onto a stage of eight seats. Chat runs alongside the stream.

Video, audio, and screen share are powered by [LiveKit](https://livekit.io).

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in your LiveKit credentials
npm run dev
```

Open http://localhost:3000.

Without LiveKit credentials the landing page works fully; opening a room shows a
configuration screen with the exact env vars to set.

## Environment

Create `.env.local` (see `.env.local.example`). LiveKit is required for video;
the chain vars are optional and enable real network switching + balance reading.

```
# LiveKit
LIVEKIT_API_KEY=your_api_key          # server-side only
LIVEKIT_API_SECRET=your_api_secret    # server-side only
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_ALLOW_DEMO=true               # set false in prod to require a wallet

# Wallet auth
AUTH_SECRET=change-me-to-a-long-random-string

# RobinHood Chain (optional — unset = demo mode with mock holdings)
NEXT_PUBLIC_CHAIN_ID=
NEXT_PUBLIC_CHAIN_NAME=RobinHood Chain
NEXT_PUBLIC_CHAIN_RPC_URL=
NEXT_PUBLIC_CHAIN_EXPLORER_URL=
NEXT_PUBLIC_CHAIN_SYMBOL=ETH
```

The quickest way to get LiveKit keys is a free project on
[LiveKit Cloud](https://cloud.livekit.io). For local dev you can also run the
LiveKit server via `livekit-server --dev` and use `devkey` / `devsecret`.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run Next.js lint

## How it works

The wallet stands in for the login, the guest list, and the subscriber base:

1. **Connect & prove ownership** — `WalletContext.connect()` requests the account
   from an injected EIP-1193 wallet, prompts a switch to RobinHood Chain, then has
   the user sign a server-issued challenge (a Sign-In-with-Ethereum style message).
   The signed proof is cached (24h) and the address becomes the LiveKit identity.
   With no injected wallet, it falls back to a stable demo identity.
2. **Read holdings (any coin)** — `GET /api/wallet/coins` reads every ERC-20 the
   wallet holds directly from RobinHood Chain's Blockscout explorer
   (`/api/v2/addresses/{wallet}/token-balances`) — no hardcoded token list. Each
   coin's dev is the contract's deployer (`creator_address_hash`), cached
   process-wide. Rooms are keyed by contract address (unique), not ticker.
3. **Pick a coin** — the dev of a coin sees `Go live`; holders see `Join` only
   when the dev is live, else `Not live`. Routes are `/room/{contract}?t=SYMBOL`.
4. **Broadcast** — the room connects to LiveKit. The host publishes camera/mic on
   entry; anyone with publish rights can toggle mic, camera, or screen share and
   take one of the eight stage seats. Chat rides LiveKit's data channel.

### Wallet auth flow (ownership proof)

1. Client requests the account and calls `POST /api/auth/challenge` with the
   address. The server returns a human-readable message embedding a nonce, an
   expiry, and an HMAC — stateless and self-verifying, no session store.
2. The wallet signs the message with `personal_sign`.
3. `POST /api/livekit/token` receives `{ address, message, signature }`, re-checks
   the HMAC/expiry, then uses viem's `recoverMessageAddress` to confirm the
   signature recovers to the claimed address before minting a token. Demo
   identities (no signature) are accepted only when `LIVEKIT_ALLOW_DEMO` isn't
   `false`.

### LiveKit token flow

`POST /api/livekit/token` mints a scoped access token with the LiveKit server SDK.
The room name is the coin ticker, the identity is the wallet address, and the grant
controls publish rights. Secrets stay on the server; the browser only ever receives
a short-lived JWT plus the public WebSocket URL.

## Structure

```
app/
  layout.tsx                 # <html>, fonts, metadata, <Providers>
  providers.tsx              # WalletProvider (client)
  page.tsx                   # landing page, wrapped in RoomProvider
  globals.css                # all styles (landing + live room)
  api/livekit/token/route.ts # LiveKit access-token endpoint (Node runtime)
  room/[token]/page.tsx      # room entry: resolves identity + token, then LiveRoom
  api/auth/challenge/route.ts  # issues signed sign-in challenges
  api/wallet/coins/route.ts    # reads ERC-20 holdings (or demo data)
lib/
  data.ts                    # demo coins, chat scripts, tape/room data
  chain.ts                   # chain config (RobinHood Chain defaults) + fallback registry
  robinhood.ts               # Blockscout: holdings + contract creator (dev), cached
  livekitServer.ts           # room/participant listing -> live status
  eip1193.ts                 # injected-wallet helpers (connect / sign / switch)
  authChallenge.ts           # stateless HMAC challenge create/verify
  useReducedMotion.ts        # prefers-reduced-motion hook
  useLiveKitToken.ts         # fetches a token using the wallet's signed proof
components/
  WalletContext.tsx          # wallet connect, ownership proof, holdings
  ConnectButton.tsx          # connect + reflect connected address
  Background.tsx Nav.tsx Hero.tsx Console.tsx RoomContext.tsx
  Tape.tsx Wallet.tsx Studio.tsx Rooms.tsx Cta.tsx Footer.tsx RevealObserver.tsx
  live/
    LiveRoom.tsx             # <LiveKitRoom> wrapper + room layout
    RoomHeader.tsx           # ticker, ON AIR, participant count
    Stage.tsx                # featured screen/camera + eight-seat stage
    Controls.tsx             # mic / camera / screen share / leave
    LiveChat.tsx             # chat over LiveKit data channel
```

## Notes on the wallet

RobinHood Chain is an EVM (Arbitrum-Orbit) network, so the integration uses the
standard injected EIP-1193 flow (`window.ethereum`): request accounts, switch/add
the network, and `personal_sign` a challenge. Ownership is verified server-side, so
a client can't obtain a LiveKit token for an address it doesn't control.

Holdings and coin devs are read live from the chain (Blockscout), so Livego works
for **any** coin on RobinHood Chain with no per-token configuration. `lib/robinhood.ts`
handles the explorer calls; `lib/chain.ts` `TOKEN_REGISTRY` and the demo coins in
`lib/data.ts` are only used as a fallback when the explorer is unreachable.

Publish rights are least-privilege: the token server grants `canPublish` only to a
coin's dev — the address that **deployed the contract** (`creator_address_hash`).
Everyone else joins subscribe-only. A room reports "live" when its dev is actively
publishing, checked via LiveKit's room/participant listing in `lib/livekitServer.ts`.

**Testing without deploying a token:** `DEV_OVERRIDES` maps a ticker *or contract
address* to a dev address, e.g.
`DEV_OVERRIDES=0xcontract…:0xyourwallet`. That wallet then gets host rights for
that coin, so you can exercise the Go live / Join flows end to end.

USD pricing comes from the explorer's exchange rate when available (else `—`). No
injected wallet + `NEXT_PUBLIC_ALLOW_DEMO=false` blocks connecting entirely.

## General notes

- Interactive pieces are client components; static sections are server components.
- Randomized DOM (data wall, waveforms, chart) is generated inside `useEffect` to
  avoid hydration mismatches.
- All original CSS, animations, and `prefers-reduced-motion` handling are preserved.

import { privateKeyToAccount } from "viem/accounts";

const BASE = "http://localhost:3000";

async function challenge(address) {
  const r = await fetch(`${BASE}/api/auth/challenge`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address }),
  });
  return (await r.json()).message;
}

async function token(payload) {
  const r = await fetch(`${BASE}/api/livekit/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { status: r.status, body: await r.json() };
}

const account = privateKeyToAccount(
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
);
const address = account.address;
console.log("wallet:", address, "\n");

const msg = await challenge(address);
const signature = await account.signMessage({ message: msg });

for (const room of ["HOOD", "PERP", "USDG"]) {
  const res = await token({ room, address, message: msg, signature });
  console.log(
    `${room}: [${res.status}] canPublish=${res.body.canPublish} ${
      res.body.error ? "(" + res.body.error + ")" : ""
    }`
  );
}

// demo request should now be rejected (demo off)
const demo = await token({ room: "HOOD", address, demo: true });
console.log(`\ndemo mode: [${demo.status}] ${demo.body.error ?? "issued (unexpected)"}`);

// holdings endpoint
const coinsRes = await fetch(
  `${BASE}/api/wallet/coins?address=${address}`
).then((r) => r.json());
console.log("\ncoins:");
for (const c of coinsRes.coins) {
  const mine = c.dev && c.dev.toLowerCase() === address.toLowerCase();
  console.log(
    `  $${c.t}  live=${c.live} viewers=${c.v} dev=${c.dev?.slice(0, 8)}… ${
      mine ? "(you)" : ""
    }`
  );
}

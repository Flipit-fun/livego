import { privateKeyToAccount } from "viem/accounts";

const BASE = "http://localhost:3000";

async function getChallenge(address) {
  const r = await fetch(`${BASE}/api/auth/challenge`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address }),
  });
  return r.json();
}

async function getToken(payload) {
  const r = await fetch(`${BASE}/api/livekit/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { status: r.status, body: await r.json() };
}

function summarize(label, res) {
  const ok = res.body.token ? "TOKEN ISSUED" : `REJECTED (${res.body.error})`;
  console.log(`${label}: [${res.status}] ${ok}`);
}

const account = privateKeyToAccount(
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
);
const address = account.address;
console.log("test address:", address);

// 1. valid signed proof
const { message } = await getChallenge(address);
const signature = await account.signMessage({ message });
summarize(
  "valid signature ",
  await getToken({ room: "HOOD", address, message, signature, canPublish: true })
);

// 2. tampered signature (flip a byte inside r)
const flipped = signature[10] === "a" ? "b" : "a";
const tampered = signature.slice(0, 10) + flipped + signature.slice(11);
summarize(
  "tampered sig    ",
  await getToken({ room: "HOOD", address, message, signature: tampered, canPublish: true })
);

// 2b. tampered challenge message (HMAC must fail)
summarize(
  "tampered message",
  await getToken({
    room: "HOOD",
    address,
    message: message.replace(/Nonce: .+/, "Nonce: deadbeef"),
    signature,
    canPublish: true,
  })
);

// 3. signature from a different key claiming this address
const other = privateKeyToAccount(
  "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba"
);
const otherSig = await other.signMessage({ message });
summarize(
  "wrong signer    ",
  await getToken({ room: "HOOD", address, message, signature: otherSig, canPublish: true })
);

// 4. demo mode (no signature)
summarize(
  "demo mode       ",
  await getToken({ room: "HOOD", address, demo: true, canPublish: false })
);

// 5. missing proof, not demo
summarize(
  "no proof        ",
  await getToken({ room: "HOOD", address, canPublish: true })
);

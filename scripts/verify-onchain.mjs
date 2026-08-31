import { privateKeyToAccount } from "viem/accounts";

const BASE = "http://localhost:3000";
const acct = privateKeyToAccount(
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
);
const addr = acct.address;

const msg = (
  await (
    await fetch(BASE + "/api/auth/challenge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ address: addr }),
    })
  ).json()
).message;
const signature = await acct.signMessage({ message: msg });

// USDG on RobinHood Chain - deployed by someone other than our test wallet.
const contract = "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168";

const r = await fetch(BASE + "/api/livekit/token", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ room: contract, address: addr, message: msg, signature }),
});
const j = await r.json();

console.log("wallet:            ", addr);
console.log("room (contract):   ", contract);
console.log("status:            ", r.status);
console.log("token issued:      ", !!j.token);
console.log("canPublish:        ", j.canPublish, "(expected false - not the deployer)");

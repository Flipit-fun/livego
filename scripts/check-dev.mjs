// Replicates lib/robinhood.ts dev resolution against the live explorer.
const BASE = "https://robinhoodchain.blockscout.com/api/v2";

async function creationTxFrom(txHash) {
  const r = await fetch(`${BASE}/transactions/${txHash}`);
  if (!r.ok) return null;
  const tx = await r.json();
  return tx.from?.hash?.toLowerCase() ?? null;
}

async function resolveDev(contract) {
  const r = await fetch(`${BASE}/addresses/${contract}`);
  if (!r.ok) return null;
  const d = await r.json();
  const txHash = d.creation_transaction_hash || d.creation_tx_hash;
  const creator = d.creator_address_hash?.toLowerCase() ?? null;
  let dev = null;
  if (txHash) dev = await creationTxFrom(txHash);
  return { name: d.name, creator, dev: dev ?? creator };
}

const targets = process.argv.slice(2);
if (targets.length === 0)
  targets.push("0x08f492AF1e7302e9bd8D9Ab6556CF5a5de0B88E8");

for (const c of targets) {
  const info = await resolveDev(c);
  console.log(`\n${c}`);
  console.log("  name:            ", info.name);
  console.log("  creator (on-chn):", info.creator, "(may be a factory)");
  console.log("  resolved dev:    ", info.dev, "(EOA launcher - what StreamGo uses)");
}

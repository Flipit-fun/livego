"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseEther, encodeFunctionData, toHex } from "viem";
import { useWallet } from "@/components/WalletContext";
import { useToast } from "@/components/Toast";
import { getProvider } from "@/lib/eip1193";
import { PONS_FACTORY, FACTORY_ABI, LAUNCH_FEE, LAUNCH_CONFIG_ID, DEX_ID, TOKEN_LAUNCHED_TOPIC } from "@/lib/pons";
import LogoMark from "@/components/LogoMark";
import Link from "next/link";

export default function LaunchPage() {
  const { connected, address, connect } = useWallet();
  const toast = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [discord, setDiscord] = useState("");
  const [website, setWebsite] = useState("");
  const [initialBuy, setInitialBuy] = useState("");
  const [launching, setLaunching] = useState(false);

  const doLaunch = async () => {
    if (!connected || !address) {
      const a = await connect();
      if (!a) return;
    }

    if (!name.trim() || !symbol.trim()) {
      toast("Name and symbol are required");
      return;
    }

    const provider = getProvider();
    if (!provider) {
      toast("No wallet found");
      return;
    }

    setLaunching(true);
    try {
      // Ensure we're on RobinHood Chain before sending the tx
      const { ensureChain, getChainId } = await import("@/lib/eip1193");
      await ensureChain();
      const chainId = await getChainId();
      if (chainId !== 4663) {
        toast("Please switch to RobinHood Chain (chain ID 4663) in your wallet");
        setLaunching(false);
        return;
      }

      const initialBuyWei = initialBuy ? parseEther(initialBuy) : 0n;
      const launchFeeWei = parseEther(LAUNCH_FEE);
      const value = launchFeeWei + initialBuyWei;

      // Generate a random salt for deterministic deployment
      const saltBytes = new Uint8Array(32);
      crypto.getRandomValues(saltBytes);
      const salt = toHex(saltBytes);

      const data = encodeFunctionData({
        abi: FACTORY_ABI,
        functionName: "launchToken",
        args: [
          {
            name: name.trim(),
            symbol: symbol.trim().toUpperCase(),
            logo: logo.trim(),
            description: description.trim(),
            socials: {
              twitter: twitter.trim(),
              telegram: telegram.trim(),
              discord: discord.trim(),
              website: website.trim(),
              farcaster: "",
            },
            feeWallet: address as `0x${string}`,
          },
          LAUNCH_CONFIG_ID,
          DEX_ID,
          salt as `0x${string}`,
        ],
      });

      // Format value as proper hex (with 0x prefix, no leading zeros issue)
      const hexValue = "0x" + value.toString(16);

      const txHash = (await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to: PONS_FACTORY,
            data,
            value: hexValue,
          },
        ],
      })) as string;

      if (!txHash) {
        toast("No transaction hash returned - check your wallet");
        setLaunching(false);
        return;
      }

      toast("Transaction submitted - waiting for confirmation...");

      // Wait for receipt
      let receipt = null;
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        receipt = (await provider.request({
          method: "eth_getTransactionReceipt",
          params: [txHash],
        })) as { status: string; logs: Array<{ topics: string[]; address: string; data: string }> } | null;
        if (receipt) break;
      }

      if (!receipt || receipt.status !== "0x1") {
        toast("Transaction failed");
        setLaunching(false);
        return;
      }

      // Find TokenLaunched event
      const launchLog = receipt.logs.find(
        (l) =>
          l.address.toLowerCase() === PONS_FACTORY.toLowerCase() &&
          l.topics[0]?.toLowerCase() === TOKEN_LAUNCHED_TOPIC
      );

      let tokenAddress: string | null = null;
      if (launchLog && launchLog.topics[1]) {
        // token is the first indexed param (address padded to 32 bytes)
        tokenAddress = "0x" + launchLog.topics[1].slice(26);
      }

      if (!tokenAddress) {
        toast("Launch succeeded but couldn't find token address");
        setLaunching(false);
        return;
      }

      // Register in our Supabase registry
      await fetch("/api/launches/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token: tokenAddress,
          deployer: address,
          txHash,
          name: name.trim(),
          symbol: symbol.trim().toUpperCase(),
          logo: logo.trim(),
          description: description.trim(),
          twitter: twitter.trim(),
          telegram: telegram.trim(),
          discord: discord.trim(),
          website: website.trim(),
        }),
      });

      toast(`$${symbol.toUpperCase()} launched! Redirecting to your room...`);
      setTimeout(() => {
        router.push(`/room/${tokenAddress}?t=${encodeURIComponent(symbol.trim().toUpperCase())}`);
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Launch error:", err);
      if (msg.includes("rejected") || msg.includes("denied") || msg.includes("User rejected")) {
        toast("Transaction rejected by user");
      } else if (msg.includes("insufficient")) {
        toast("Insufficient ETH on RobinHood Chain");
      } else {
        toast("Launch failed: " + msg.slice(0, 100));
      }
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="wrap" style={{ paddingTop: 100, paddingBottom: 80, minHeight: "100dvh" }}>
      <Link href="/" className="brand" style={{ marginBottom: 40, display: "inline-flex" }}>
        <LogoMark />
        StreamGo
      </Link>

      <div className="sec-head">
        <div className="eyebrow">Launch on pons via StreamGo</div>
        <h2>Create a token and go live.</h2>
        <p>
          Deploy a fixed-supply token on RobinHood Chain through the pons factory.
          Your token will appear in StreamGo and you can start streaming to holders
          immediately.
        </p>
      </div>

      <div className="glass panel" style={{ maxWidth: 600 }}>
        <div className="launch-form">
          <div className="lf-row">
            <label className="lf-label">Name *</label>
            <input
              className="lf-input"
              placeholder="e.g. My Token"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="lf-row">
            <label className="lf-label">Symbol *</label>
            <input
              className="lf-input"
              placeholder="e.g. MYTKN"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              style={{ textTransform: "uppercase" }}
            />
          </div>
          <div className="lf-row">
            <label className="lf-label">Logo URL</label>
            <input
              className="lf-input"
              placeholder="https://... (image URL)"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
            />
          </div>
          <div className="lf-row">
            <label className="lf-label">Description</label>
            <textarea
              className="lf-input lf-textarea"
              placeholder="What is this token about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="lf-row">
            <label className="lf-label">Twitter</label>
            <input className="lf-input" placeholder="@handle or URL" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
          </div>
          <div className="lf-row">
            <label className="lf-label">Telegram</label>
            <input className="lf-input" placeholder="t.me/..." value={telegram} onChange={(e) => setTelegram(e.target.value)} />
          </div>
          <div className="lf-row">
            <label className="lf-label">Discord</label>
            <input className="lf-input" placeholder="discord.gg/..." value={discord} onChange={(e) => setDiscord(e.target.value)} />
          </div>
          <div className="lf-row">
            <label className="lf-label">Website</label>
            <input className="lf-input" placeholder="https://..." value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <div className="lf-row">
            <label className="lf-label">Initial buy (ETH on RobinHood Chain)</label>
            <input
              className="lf-input"
              placeholder="0 (optional - buy your own token on launch)"
              value={initialBuy}
              onChange={(e) => setInitialBuy(e.target.value)}
              type="number"
              step="0.001"
              min="0"
            />
          </div>

          <div className="lf-footer">
            <span className="lf-fee mono">Launch fee: {LAUNCH_FEE} ETH on RobinHood Chain</span>
            <button className="btn" onClick={doLaunch} disabled={launching}>
              {launching ? "Launching..." : connected ? "Launch token" : "Connect & launch"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

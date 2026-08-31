"use client";

import { useWallet } from "./WalletContext";
import { useToast } from "./Toast";

interface ConnectButtonProps {
  className?: string;
  label?: string;
}

export default function ConnectButton({
  className = "btn",
  label = "Connect wallet",
}: ConnectButtonProps) {
  const { status, connected, short, connect, disconnect } = useWallet();
  const toast = useToast();

  const handleClick = () => {
    if (status === "connecting") return;
    if (connected) {
      disconnect();
      toast("Wallet disconnected");
      return;
    }
    connect().then((addr) => {
      if (addr) {
        toast("Wallet connected");
        document
          .getElementById("walletPanel")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  };

  let text = label;
  if (status === "connecting") text = "Connecting...";
  else if (connected && short) text = short;

  return (
    <button
      className={className}
      onClick={handleClick}
      disabled={status === "connecting"}
      title={connected ? "Click to disconnect" : "Connect your wallet"}
    >
      {text}
    </button>
  );
}

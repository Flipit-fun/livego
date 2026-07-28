"use client";

import { useWallet } from "./WalletContext";

interface ConnectButtonProps {
  className?: string;
  /** When connected, show the shortened address instead of "Wallet connected". */
  showAddress?: boolean;
  label?: string;
}

export default function ConnectButton({
  className = "btn",
  showAddress = false,
  label = "Connect wallet",
}: ConnectButtonProps) {
  const { status, connected, short, connect } = useWallet();

  const handleClick = () => {
    if (status === "connecting") return;
    connect().then((addr) => {
      if (addr) {
        document
          .getElementById("walletPanel")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  };

  let text = label;
  if (status === "connecting") text = "Connecting…";
  else if (connected) text = showAddress && short ? short : "Wallet connected";

  return (
    <button
      className={className}
      onClick={handleClick}
      disabled={status === "connecting"}
    >
      {text}
    </button>
  );
}

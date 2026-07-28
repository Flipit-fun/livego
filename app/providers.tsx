"use client";

import { ReactNode } from "react";
import { WalletProvider } from "@/components/WalletContext";

export default function Providers({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}

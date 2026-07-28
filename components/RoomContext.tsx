"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface RoomContextValue {
  selectedTicker: string;
  selectRoom: (ticker: string) => void;
  reduce: boolean;
}

const RoomContext = createContext<RoomContextValue | null>(null);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [selectedTicker, setSelectedTicker] = useState("HOOD");
  const reduce = useReducedMotion();

  const selectRoom = (ticker: string) => {
    setSelectedTicker(ticker);
    document
      .getElementById("console")
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  return (
    <RoomContext.Provider value={{ selectedTicker, selectRoom, reduce }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom(): RoomContextValue {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used within RoomProvider");
  return ctx;
}

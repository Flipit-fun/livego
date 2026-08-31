import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Called by the client after a successful pons factory launch tx.
// Records the token in our registry so it appears in StreamGo.
export async function POST(req: NextRequest) {
  let body: {
    token?: string;
    deployer?: string;
    txHash?: string;
    name?: string;
    symbol?: string;
    logo?: string;
    description?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const token = body.token?.trim().toLowerCase();
  const deployer = body.deployer?.trim().toLowerCase();
  const txHash = body.txHash?.trim().toLowerCase();

  if (!token || !isAddress(token)) {
    return NextResponse.json({ error: "Valid `token` address required." }, { status: 400 });
  }
  if (!deployer || !isAddress(deployer)) {
    return NextResponse.json({ error: "Valid `deployer` address required." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("launches").upsert(
    {
      token,
      deployer,
      tx_hash: txHash || null,
      name: body.name || null,
      symbol: body.symbol || null,
      logo: body.logo || null,
      description: body.description || null,
      twitter: body.twitter || null,
      telegram: body.telegram || null,
      discord: body.discord || null,
      website: body.website || null,
      launched_at: new Date().toISOString(),
    },
    { onConflict: "token" }
  );

  if (error) {
    console.error("supabase insert error:", error);
    return NextResponse.json({ error: "Failed to register launch." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, token });
}

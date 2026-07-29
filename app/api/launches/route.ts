import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getLiveStatus } from "@/lib/livekitServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns all tokens launched through Livego, ordered newest first.
export async function GET() {
  const { data, error } = await supabase
    .from("launches")
    .select("*")
    .order("launched_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("supabase select error:", error);
    return NextResponse.json({ launches: [] });
  }

  // Enrich with live-stream status from LiveKit.
  const tokens = (data || []).map((r) => r.token as string);
  const status = await getLiveStatus(tokens);

  const launches = (data || []).map((r) => ({
    token: r.token,
    deployer: r.deployer,
    name: r.name,
    symbol: r.symbol,
    logo: r.logo,
    description: r.description,
    twitter: r.twitter,
    telegram: r.telegram,
    discord: r.discord,
    website: r.website,
    launchedAt: r.launched_at,
    live: status.get(r.token)?.live ?? false,
    viewers: status.get(r.token)?.viewers ?? 0,
  }));

  return NextResponse.json({ launches });
}

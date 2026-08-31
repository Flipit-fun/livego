import { NextRequest, NextResponse } from "next/server";
import { createChallenge } from "@/lib/authChallenge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

export async function POST(req: NextRequest) {
  let body: { address?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const address = body.address?.trim();
  if (!address || !ADDRESS_RE.test(address)) {
    return NextResponse.json(
      { error: "A valid `address` is required." },
      { status: 400 }
    );
  }

  return NextResponse.json(createChallenge(address));
}

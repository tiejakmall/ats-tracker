import { NextRequest, NextResponse } from "next/server";
import { addCandidates } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const { candidates } = await req.json();
    await addCandidates(candidates);
    return NextResponse.json({ success: true, added: candidates.length });
  } catch (e: unknown) {
    console.error("add error:", e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getCandidates } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCandidates();
    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    console.error("getCandidates error:", e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

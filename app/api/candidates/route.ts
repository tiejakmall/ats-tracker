import { NextResponse } from "next/server";
import { scriptGet } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await scriptGet("getCandidates");
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { updateStage, updateFinalStatus } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, newStatus, finalStatus } = body;

    if (finalStatus !== undefined) {
      await updateFinalStatus(email, finalStatus);
    } else {
      await updateStage(email, newStatus);
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error("update error:", e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

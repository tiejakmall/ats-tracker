import { NextRequest, NextResponse } from "next/server";
import { scriptPost } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // { recipients: [...] }
    const data = await scriptPost("sendEmail", body);
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

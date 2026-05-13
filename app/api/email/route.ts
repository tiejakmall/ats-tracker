import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { recipients } = await req.json();
    // recipients: [{ email, name, position, subject, body }]

    const scriptUrl    = process.env.APPS_SCRIPT_URL;
    const scriptSecret = process.env.APPS_SCRIPT_SECRET;

    if (!scriptUrl) {
      return NextResponse.json({ success: false, error: "APPS_SCRIPT_URL not set" }, { status: 500 });
    }

    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sendEmail",
        secret: scriptSecret,
        recipients,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: unknown) {
    console.error("email error:", e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

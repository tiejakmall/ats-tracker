// Server-side only — called from Next.js API routes
// Never import this directly in client components

const BASE_URL = process.env.APPS_SCRIPT_URL!;
const SECRET   = process.env.APPS_SCRIPT_SECRET!;

export async function scriptGet<T>(action: string): Promise<T> {
  const url = `${BASE_URL}?action=${action}&secret=${SECRET}`;
  const res  = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Apps Script GET failed: ${res.status}`);
  return res.json();
}

export async function scriptPost<T>(action: string, payload: object): Promise<T> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, secret: SECRET, ...payload }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Apps Script POST failed: ${res.status}`);
  return res.json();
}

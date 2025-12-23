// app/api/apply/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const payload = {
      fullName: String(form.get('fullName') || ''),
      socialLinks: String(form.get('socialLinks') || ''),
      audience: String(form.get('audience') || ''),
      motivation: String(form.get('motivation') || ''),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      // Local fallback: accept silently so the flow is testable without envs
      console.warn('[apply] Missing Supabase envs. Returning 200 (local/dev).');
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Insert with REST (keeps it simple for local)
    const res = await fetch(`${url}/rest/v1/seller_applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      return new NextResponse(body || 'Insert failed', { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message ?? 'Unexpected error', { status: 500 });
  }
}

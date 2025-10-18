export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('[health] alive');
  return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
    headers: { 'content-type': 'application/json' },
    status: 200,
  });
}

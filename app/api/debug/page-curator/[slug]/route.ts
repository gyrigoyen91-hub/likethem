import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  ctx: { params: { slug: string } }
) {
  const { slug } = ctx.params;
  
  try {
    console.log('[debug/page-curator] slug =', slug);
    
    const supabase = getSupabaseServer();
    
    // Run the same query as the page
    const { data: curator, error } = await supabase
      .from('curator_profiles')
      .select('*')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .single();
    
    console.log('[debug/page-curator] result:', { data: curator, error });
    
    if (error) {
      return NextResponse.json({ 
        found: false, 
        error: error.message,
        slug 
      }, { status: 404 });
    }
    
    if (!curator) {
      return NextResponse.json({ 
        found: false, 
        message: 'No curator found',
        slug 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      found: true, 
      data: curator,
      slug 
    });
    
  } catch (e: any) {
    console.error('[debug/page-curator] unexpected error', e);
    return NextResponse.json({ 
      error: 'Server error', 
      detail: String(e?.message || e),
      slug 
    }, { status: 500 });
  }
}

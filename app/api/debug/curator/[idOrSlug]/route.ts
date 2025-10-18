import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { idOrSlug: string } }
) {
  try {
    // Gate: Only allow in development or for admin users
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!isDevelopment) {
      const session = await getServerSession(authOptions)
      const isAdmin = session?.user?.role === 'ADMIN'
      
      if (!isAdmin) {
        return NextResponse.json({ 
          error: 'Not found' 
        }, { status: 404 })
      }
    }

    console.log('[curator-debug] idOrSlug =', params.idOrSlug);
    
    const { data, error } = await supabase
      .from('curator_profiles')
      .select('id, slug, "isPublic"')
      .or(`id.eq.${params.idOrSlug},slug.eq.${params.idOrSlug}`)
      .maybeSingle();

    if (error) {
      console.log('[curator-debug] Error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json(data ? { found: true, data } : { error: 'Not found' }, { status: data ? 200 : 404 });

  } catch (error) {
    console.error('[debug][curator] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

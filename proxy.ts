import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Fichiers publics accessibles sans authentification
  if (
    pathname === '/manifest.json' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js' ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple-icon') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute =
    pathname.startsWith('/connexion') ||
    pathname.startsWith('/inscription') ||
    pathname.startsWith('/invitation')

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/connexion'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/aujourdhui',
    '/calendrier/:path*',
    '/galerie/:path*',
    '/timeline',
    '/bilan/:path*',
    '/retro',
    '/lieux',
    '/mots-amour',
    '/bucket-list',
    '/capsules',
    '/dates-importantes',
    '/quiz',
    '/notre-chanson',
    '/parametres/:path*',
    '/souvenirs/:path*',
    '/jour/:path*',
    '/inviter',
    '/installer',
    '/connexion',
    '/inscription',
    '/invitation/:path*',
    '/onboarding',
  ],
}

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    const { data: { session } } = await supabase.auth.getSession()

    // If user is not signed in and the current path starts with /app
    if (!session && request.nextUrl.pathname.startsWith('/app')) {
      const redirectUrl = new URL('/', request.url)
      // Add error message to the URL if there was an authentication error
      if (request.nextUrl.searchParams.has('error')) {
        redirectUrl.searchParams.set('error', request.nextUrl.searchParams.get('error')!)
      }
      return NextResponse.redirect(redirectUrl)
    }

    // If user is signed in and the current path is / or /auth/callback
    if (session && (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/auth/callback')) {
      const redirectUrl = new URL('/app/dashboard', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch (error) {
    console.error('Error in middleware:', error)
    // If there's an error, redirect to home page with error message
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('error', 'An error occurred during authentication')
    return NextResponse.redirect(redirectUrl)
  }
}

export const config = {
  matcher: ['/', '/app/:path*', '/auth/callback'],
} 
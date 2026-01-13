import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/setup'
    const error_description = searchParams.get('error_description')
    const error = searchParams.get('error')

    console.log('Auth Callback:', { code: !!code, next, error, error_description })

    if (error || error_description) {
        console.error('Auth Error:', error, error_description)
        return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(error_description || error || 'Authentication failed')}`)
    }

    if (code) {
        const supabase = await createClient()
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (!exchangeError) {
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError) {
                console.error('Get User Error:', userError)
                return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(userError.message)}`)
            }

            if (user) {
                console.log('Auth Success for User:', user.id)
                // Check if profile is complete
                const { data: userData, error: dbError } = await supabase
                    .from("users")
                    .select("username, birthday, location")
                    .eq("id", user.id)
                    .single()

                if (dbError) {
                    console.error('Database Error fetching user:', dbError)
                    // If the row doesn't exist, it might be the trigger failing. Redirect to setup.
                    return NextResponse.redirect(`${origin}/setup`)
                }

                if (userData?.username && userData?.birthday && userData?.location) {
                    return NextResponse.redirect(`${origin}/home`)
                } else {
                    return NextResponse.redirect(`${origin}/setup`)
                }
            }
        } else {
            console.error('Exchange Code Error:', exchangeError)
            return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(exchangeError.message)}`)
        }
    }

    // Return the user to an error page with instructions
    console.error('No code provided in auth callback')
    return NextResponse.redirect(`${origin}/auth?error=No code provided`)
}

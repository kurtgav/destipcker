import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/setup'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Check if profile is complete
                const { data: userData } = await supabase
                    .from("users")
                    .select("username, birthday, location")
                    .eq("id", user.id)
                    .single()

                if (userData?.username && userData?.birthday && userData?.location) {
                    return NextResponse.redirect(`${origin}/home`)
                } else {
                    return NextResponse.redirect(`${origin}/setup`)
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth?error=Could not authenticate user`)
}

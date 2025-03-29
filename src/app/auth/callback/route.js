import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic" // Ensure dynamic handling

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")
  const type = requestUrl.searchParams.get("type")

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // If it's a password reset, redirect to the reset password page
  if (type === "recovery") {
    return NextResponse.redirect(
      new URL("/auth/reset-password", requestUrl.origin)
    )
  }

  // For other auth flows, redirect to home or the specified next URL
  return NextResponse.redirect(new URL(next || "/", requestUrl.origin))
}

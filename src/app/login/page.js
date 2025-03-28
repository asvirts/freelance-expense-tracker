"use client"

import { useState, useEffect } from "react"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { useRouter } from "next/navigation"
import getSupabaseBrowserClient from "@/lib/supabaseClient"

export default function Login() {
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        router.push("/")
      }
    })

    async function checkSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (session?.user) {
        router.push("/")
      }
    }
    checkSession()

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase, router])

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["github"]}
          socialLayout="horizontal"
          theme="default"
          redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`}
        />
      </div>
    </div>
  )
}

"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import getSupabaseBrowserClient from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button" // Assuming shadcn button is available

// Import feature components
import { ClientList } from "@/components/ClientList"
import { IncomeList } from "@/components/IncomeList"
import { ExpenseList } from "@/components/ExpenseList"
import { MonthlySummary } from "@/components/MonthlySummary"
import { toast } from "sonner"

export default function Home() {
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [refreshSummary, setRefreshSummary] = useState(0) // State to trigger summary refresh

  // Fetch Clients (needed for Income form dropdown)
  const fetchClients = useCallback(
    async (userId) => {
      setLoadingClients(true)
      try {
        const { data, error } = await supabase
          .from("fet-clients")
          .select("id, name")
          .eq("user_id", userId)
          .order("name", { ascending: true })

        if (error) throw error
        setClients(data || [])
      } catch (error) {
        console.error("Error fetching clients for dropdown:", error)
        toast.error(`Error fetching clients: ${error.message}`)
        setClients([])
      } finally {
        setLoadingClients(false)
      }
    },
    [supabase]
  )

  // Auth Effect
  useEffect(() => {
    let isMounted = true // Prevent state updates on unmounted component
    async function getUserAndClients() {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession()
      if (error) {
        console.error("Error getting session:", error)
        if (isMounted) setLoading(false)
        return
      }
      if (!session?.user) {
        router.push("/login")
      } else {
        if (isMounted) {
          setUser(session.user)
          setLoading(false)
          fetchClients(session.user.id) // Fetch clients after user is confirmed
        }
      }
    }
    getUserAndClients()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return
      if (event === "SIGNED_OUT") {
        router.push("/login")
      } else if (session?.user) {
        setUser(session.user)
        // Re-fetch clients if user potentially changed, though less likely here
        fetchClients(session.user.id)
      } else {
        router.push("/login")
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [supabase, router, fetchClients]) // Add fetchClients dependency

  const handleLogout = async () => {
    setLoading(true) // Show loading on logout
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error logging out:", error)
      toast.error(`Logout failed: ${error.message}`)
      setLoading(false)
    } else {
      // Redirect is handled by onAuthStateChange
      setUser(null)
      setClients([])
    }
  }

  // Callback to trigger summary refresh
  const handleDataChanged = () => {
    setRefreshSummary((prev) => prev + 1)
    // Optionally re-fetch clients if an income/expense action might imply client changes
    // if (user) fetchClients(user.id);
  }

  // Callback specifically for when clients list itself changes
  const handleClientListChanged = () => {
    if (user) fetchClients(user.id)
    handleDataChanged() // Also refresh summary in case client deletion affects income display
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    )
  }

  if (!user) {
    return null // Redirecting
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Freelance Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user.email}
          </span>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      <main className="space-y-6">
        {/* Monthly Summary */}
        <MonthlySummary key={refreshSummary} refreshTrigger={refreshSummary} />

        {/* Clients List */}
        {/* Pass handleClientListChanged to ClientList if it needs to trigger re-fetch of clients in this parent */}
        <ClientList />

        {/* Income List */}
        {/* Pass loadingClients and clients to IncomeList */}
        {loadingClients ? (
          <p>Loading client data for income...</p>
        ) : (
          <IncomeList clients={clients} onDataChanged={handleDataChanged} />
        )}

        {/* Expense List */}
        <ExpenseList onDataChanged={handleDataChanged} />
      </main>
    </div>
  )
}

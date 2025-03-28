"use client"

import React, { useState, useEffect, useCallback } from "react"
import getSupabaseBrowserClient from "@/lib/supabaseClient"
import { toast } from "sonner"
import {
  startOfMonth,
  endOfMonth,
  format,
  subMonths,
  addMonths
} from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount || 0) // Handle null/undefined amount
}

export function MonthlySummary({ refreshTrigger }) {
  const supabase = getSupabaseBrowserClient()
  const [summary, setSummary] = useState({ income: 0, expenses: 0, net: 0 })
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const fetchSummaryData = useCallback(
    async (monthDate) => {
      setLoading(true)
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser()
        if (!user) throw new Error("User not authenticated")

        const startDate = format(startOfMonth(monthDate), "yyyy-MM-dd")
        const endDate = format(endOfMonth(monthDate), "yyyy-MM-dd")

        // Fetch Income
        const { data: incomeData, error: incomeError } = await supabase
          .from("fet-income")
          .select("amount")
          .eq("user_id", user.id)
          .gte("date", startDate)
          .lte("date", endDate)

        if (incomeError) throw incomeError
        const totalIncome = incomeData.reduce(
          (sum, item) => sum + item.amount,
          0
        )

        // Fetch Expenses
        const { data: expenseData, error: expenseError } = await supabase
          .from("fet-expenses")
          .select("amount")
          .eq("user_id", user.id)
          .gte("date", startDate)
          .lte("date", endDate)

        if (expenseError) throw expenseError
        const totalExpenses = expenseData.reduce(
          (sum, item) => sum + item.amount,
          0
        )

        setSummary({
          income: totalIncome,
          expenses: totalExpenses,
          net: totalIncome - totalExpenses
        })
      } catch (error) {
        console.error("Error fetching summary data:", error)
        toast.error(`Error fetching summary: ${error.message}`)
        setSummary({ income: 0, expenses: 0, net: 0 }) // Reset on error
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  useEffect(() => {
    fetchSummaryData(currentMonth)
  }, [fetchSummaryData, currentMonth, refreshTrigger]) // Re-fetch when month or trigger changes

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Monthly Summary</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-28 text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Income and expenses for the selected month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading summary...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(summary.income)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(summary.expenses)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Income</p>
              <p className="text-lg font-semibold">
                {formatCurrency(summary.net)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

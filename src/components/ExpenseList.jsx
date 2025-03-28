"use client"

import React, { useState, useEffect, useCallback } from "react"
import getSupabaseBrowserClient from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Edit, Trash2, PlusCircle } from "lucide-react"
import { format, parseISO } from "date-fns"

import { Button } from "@/components/ui/button"
import { ExpenseForm } from "@/components/ExpenseForm"
import { DataTable } from "@/components/DataTable"
import { TableCell, TableRow } from "@/components/ui/table"
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount)
}

export function ExpenseList({ onDataChanged }) {
  const supabase = getSupabaseBrowserClient()
  const [expenseList, setExpenseList] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [deletingExpenseId, setDeletingExpenseId] = useState(null)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user)
        throw new Error("User not authenticated for fetching expenses.")

      const { data, error } = await supabase
        .from("fet-expenses")
        .select("id, description, amount, date")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) throw error
      setExpenseList(data || [])
    } catch (error) {
      console.error("Error fetching expenses:", error)
      toast.error(`Error fetching expenses: ${error.message}`)
      setExpenseList([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const handleAddExpense = () => {
    setEditingExpense(null)
    setIsFormOpen(true)
  }

  const handleEditExpense = (expense) => {
    setEditingExpense(expense)
    setIsFormOpen(true)
  }

  const handleDeleteExpense = (expenseId) => {
    setDeletingExpenseId(expenseId)
    setIsConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingExpenseId) return
    try {
      const { error } = await supabase
        .from("fet-expenses")
        .delete()
        .eq("id", deletingExpenseId)

      if (error) throw error

      toast.success("Expense deleted successfully!")
      fetchExpenses() // Refresh list
      onDataChanged() // Notify parent for summary update
      setIsConfirmOpen(false)
      setDeletingExpenseId(null)
    } catch (error) {
      console.error("Error deleting expense:", error)
      toast.error(`Error deleting expense: ${error.message}`)
      setIsConfirmOpen(false)
      setDeletingExpenseId(null)
    }
  }

  const handleExpenseUpdated = () => {
    fetchExpenses() // Refresh this list
    onDataChanged() // Notify parent for summary update
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Expenses</CardTitle>
        <Button size="sm" onClick={handleAddExpense}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading expenses...</p>
        ) : expenseList.length > 0 ? (
          <DataTable headers={["Date", "Description", "Amount", "Actions"]}>
            {expenseList.map((expense) => {
              const displayDate = parseISO(expense.date)
              return (
                <TableRow key={expense.id}>
                  <TableCell>{format(displayDate, "PPP")}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{formatCurrency(expense.amount)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditExpense(expense)}
                      className="mr-2"
                      aria-label="Edit Expense"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteExpense(expense.id)}
                      aria-label="Delete Expense"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </DataTable>
        ) : (
          <p>No expense records found. Add your first expense record!</p>
        )}

        <ExpenseForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          expense={editingExpense}
          onExpenseUpdated={handleExpenseUpdated}
        />

        <DeleteConfirmationDialog
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
          onConfirm={confirmDelete}
          itemName="expense record"
        />
      </CardContent>
    </Card>
  )
}

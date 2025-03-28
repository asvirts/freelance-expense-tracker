"use client"

import React, { useState, useEffect, useCallback } from "react"
import getSupabaseBrowserClient from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Edit, Trash2, PlusCircle } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { IncomeForm } from "@/components/IncomeForm"
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

export function IncomeList({ clients, onDataChanged }) {
  const supabase = getSupabaseBrowserClient()
  const [incomeList, setIncomeList] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [deletingIncomeId, setDeletingIncomeId] = useState(null)

  // Create a client map for quick lookup
  const clientMap = React.useMemo(() => {
    return clients.reduce((acc, client) => {
      acc[client.id] = client.name
      return acc
    }, {})
  }, [clients])

  const fetchIncome = useCallback(async () => {
    setLoading(true)
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated for fetching income.")

      const { data, error } = await supabase
        .from("fet-income")
        .select("id, description, amount, date, client_id")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) throw error
      setIncomeList(data || [])
    } catch (error) {
      console.error("Error fetching income:", error)
      toast.error(`Error fetching income: ${error.message}`)
      setIncomeList([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchIncome()
  }, [fetchIncome])

  const handleAddIncome = () => {
    setEditingIncome(null)
    setIsFormOpen(true)
  }

  const handleEditIncome = (income) => {
    setEditingIncome(income)
    setIsFormOpen(true)
  }

  const handleDeleteIncome = (incomeId) => {
    setDeletingIncomeId(incomeId)
    setIsConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingIncomeId) return
    try {
      const { error } = await supabase
        .from("fet-income")
        .delete()
        .eq("id", deletingIncomeId)

      if (error) throw error

      toast.success("Income deleted successfully!")
      fetchIncome() // Refresh list
      onDataChanged() // Notify parent for summary update
      setIsConfirmOpen(false)
      setDeletingIncomeId(null)
    } catch (error) {
      console.error("Error deleting income:", error)
      toast.error(`Error deleting income: ${error.message}`)
      setIsConfirmOpen(false)
      setDeletingIncomeId(null)
    }
  }

  const handleIncomeUpdated = () => {
    fetchIncome() // Refresh this list
    onDataChanged() // Notify parent for summary update
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Income</CardTitle>
        <Button size="sm" onClick={handleAddIncome}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Income
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading income...</p>
        ) : incomeList.length > 0 ? (
          <DataTable
            headers={["Date", "Description", "Client", "Amount", "Actions"]}
          >
            {incomeList.map((income) => (
              <TableRow key={income.id}>
                <TableCell>{format(new Date(income.date), "PPP")}</TableCell>
                <TableCell>{income.description || "-"}</TableCell>
                <TableCell>
                  {income.client_id
                    ? clientMap[income.client_id] || "Unknown Client"
                    : "-"}
                </TableCell>
                <TableCell>{formatCurrency(income.amount)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditIncome(income)}
                    className="mr-2"
                    aria-label="Edit Income"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteIncome(income.id)}
                    aria-label="Delete Income"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        ) : (
          <p>No income records found. Add your first income record!</p>
        )}

        <IncomeForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          income={editingIncome}
          clients={clients} // Pass clients for the dropdown
          onIncomeUpdated={handleIncomeUpdated}
        />

        <DeleteConfirmationDialog
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
          onConfirm={confirmDelete}
          itemName="income record"
        />
      </CardContent>
    </Card>
  )
}

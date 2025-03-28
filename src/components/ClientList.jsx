"use client"

import React, { useState, useEffect, useCallback } from "react"
import getSupabaseBrowserClient from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Edit, Trash2, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ClientForm } from "@/components/ClientForm"
import { DataTable } from "@/components/DataTable"
import { TableCell, TableRow } from "@/components/ui/table"
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ClientList() {
  const supabase = getSupabaseBrowserClient()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [deletingClientId, setDeletingClientId] = useState(null)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated for fetching clients.")

      const { data, error } = await supabase
        .from("fet-clients")
        .select("id, name, created_at")
        .eq("user_id", user.id) // Fetch only user's clients
        .order("name", { ascending: true })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error("Error fetching clients:", error)
      toast.error(`Error fetching clients: ${error.message}`)
      setClients([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleAddClient = () => {
    setEditingClient(null) // Ensure we are adding, not editing
    setIsFormOpen(true)
  }

  const handleEditClient = (client) => {
    setEditingClient(client)
    setIsFormOpen(true)
  }

  const handleDeleteClient = (clientId) => {
    setDeletingClientId(clientId)
    setIsConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingClientId) return
    try {
      const { error } = await supabase
        .from("fet-clients")
        .delete()
        .eq("id", deletingClientId)

      if (error) throw error

      toast.success("Client deleted successfully!")
      fetchClients() // Refresh list after delete
      setIsConfirmOpen(false)
      setDeletingClientId(null)
    } catch (error) {
      console.error("Error deleting client:", error)
      toast.error(`Error deleting client: ${error.message}`)
      setIsConfirmOpen(false) // Still close dialog on error
      setDeletingClientId(null)
    }
  }

  const handleClientUpdated = () => {
    fetchClients() // Refresh the list when a client is added/updated
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Clients</CardTitle>
        <Button size="sm" onClick={handleAddClient}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading clients...</p>
        ) : clients.length > 0 ? (
          <DataTable headers={["Name", "Actions"]}>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClient(client)}
                    className="mr-2"
                    aria-label="Edit Client"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClient(client.id)}
                    aria-label="Delete Client"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        ) : (
          <p>No clients found. Add your first client!</p>
        )}

        <ClientForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          client={editingClient}
          onClientUpdated={handleClientUpdated}
        />

        <DeleteConfirmationDialog
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
          onConfirm={confirmDelete}
          itemName="client"
        />
      </CardContent>
    </Card>
  )
}

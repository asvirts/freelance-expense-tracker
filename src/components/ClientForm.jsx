"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import getSupabaseBrowserClient from "@/lib/supabaseClient"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Client name must be at least 2 characters." })
})

export function ClientForm({ open, onOpenChange, client, onClientUpdated }) {
  const supabase = getSupabaseBrowserClient()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client?.name || ""
    }
  })

  // Update defaultValues when client prop changes (for editing)
  React.useEffect(() => {
    form.reset({ name: client?.name || "" })
  }, [client, form])

  async function onSubmit(values) {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const clientData = { ...values, user_id: user.id }
      let result

      if (client?.id) {
        // Update existing client
        result = await supabase
          .from("fet-clients")
          .update(clientData)
          .eq("id", client.id)
          .select()
          .single()
      } else {
        // Insert new client
        result = await supabase
          .from("fet-clients")
          .insert(clientData)
          .select()
          .single()
      }

      const { error } = result
      if (error) throw error

      toast.success(`Client ${client?.id ? "updated" : "added"} successfully!`)
      onClientUpdated() // Notify parent component to refresh list
      onOpenChange(false) // Close the dialog
      form.reset() // Reset form fields
    } catch (error) {
      console.error("Error saving client:", error)
      toast.error(`Error saving client: ${error.message}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {client?.id ? "Edit Client" : "Add New Client"}
          </DialogTitle>
          <DialogDescription>
            {client?.id
              ? "Update the client details below."
              : "Enter the details for the new client."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Client"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

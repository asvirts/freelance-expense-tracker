"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import getSupabaseBrowserClient from "@/lib/supabaseClient"
import { toast } from "sonner"
import { format } from "date-fns"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { DatePicker } from "@/components/DatePicker"

const formSchema = z.object({
  description: z.string().optional(),
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  date: z.date({ required_error: "Please select a date." }),
  client_id: z.string().uuid().nullable().optional()
})

export function IncomeForm({
  open,
  onOpenChange,
  income,
  clients,
  onIncomeUpdated
}) {
  const supabase = getSupabaseBrowserClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: income?.description || "",
      amount: income?.amount || "",
      date: income?.date ? new Date(income.date) : new Date(),
      client_id: income?.client_id || null
    }
  })

  // Update defaultValues when income prop changes (for editing)
  useEffect(() => {
    form.reset({
      description: income?.description || "",
      amount: income?.amount || "",
      date: income?.date ? new Date(income.date) : new Date(),
      client_id: income?.client_id || null
    })
  }, [income, form])

  async function onSubmit(values) {
    setIsSubmitting(true)
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Format date to YYYY-MM-DD for Supabase
      const formattedDate = format(values.date, "yyyy-MM-dd")

      const incomeData = {
        description: values.description,
        amount: values.amount,
        date: formattedDate,
        client_id: values.client_id || null, // Ensure null if empty
        user_id: user.id
      }

      let result
      if (income?.id) {
        // Update
        result = await supabase
          .from("fet-income")
          .update(incomeData)
          .eq("id", income.id)
          .select()
          .single()
      } else {
        // Insert
        result = await supabase
          .from("fet-income")
          .insert(incomeData)
          .select()
          .single()
      }

      const { error } = result
      if (error) throw error

      toast.success(`Income ${income?.id ? "updated" : "added"} successfully!`)
      onIncomeUpdated()
      onOpenChange(false)
      form.reset({
        description: "",
        amount: "",
        date: new Date(),
        client_id: null
      }) // Reset form to default empty/current state
    } catch (error) {
      console.error("Error saving income:", error)
      toast.error(`Error saving income: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {income?.id ? "Edit Income" : "Add New Income"}
          </DialogTitle>
          <DialogDescription>
            {income?.id
              ? "Update the income details."
              : "Enter the details for the new income."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Project X payment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="1000.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <DatePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={null}>-- No Client --</SelectItem>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Income"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

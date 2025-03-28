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
  description: z.string().min(1, { message: "Description is required." }),
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  date: z.date({ required_error: "Please select a date." })
})

export function ExpenseForm({ open, onOpenChange, expense, onExpenseUpdated }) {
  const supabase = getSupabaseBrowserClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: expense?.description || "",
      amount: expense?.amount || "",
      date: expense?.date ? new Date(expense.date) : new Date()
    }
  })

  // Update defaultValues when expense prop changes
  useEffect(() => {
    form.reset({
      description: expense?.description || "",
      amount: expense?.amount || "",
      date: expense?.date ? new Date(expense.date) : new Date()
    })
  }, [expense, form])

  async function onSubmit(values) {
    setIsSubmitting(true)
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const formattedDate = format(values.date, "yyyy-MM-dd")

      const expenseData = {
        description: values.description,
        amount: values.amount,
        date: formattedDate,
        user_id: user.id
      }

      let result
      if (expense?.id) {
        // Update
        result = await supabase
          .from("fet-expenses")
          .update(expenseData)
          .eq("id", expense.id)
          .select()
          .single()
      } else {
        // Insert
        result = await supabase
          .from("fet-expenses")
          .insert(expenseData)
          .select()
          .single()
      }

      const { error } = result
      if (error) throw error

      toast.success(
        `Expense ${expense?.id ? "updated" : "added"} successfully!`
      )
      onExpenseUpdated()
      onOpenChange(false)
      form.reset({
        description: "",
        amount: "",
        date: new Date()
      })
    } catch (error) {
      console.error("Error saving expense:", error)
      toast.error(`Error saving expense: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {expense?.id ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
          <DialogDescription>
            {expense?.id
              ? "Update the expense details."
              : "Enter the details for the new expense."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Software subscription" {...field} />
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
                      placeholder="50.00"
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
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

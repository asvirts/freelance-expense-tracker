import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"

// Instantiate the font
// const geistSans = GeistSans({ ... }); // Removed

export const metadata = {
  title: "Freelance Expense Tracker",
  description: "Track your freelance income and expenses"
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  )
}

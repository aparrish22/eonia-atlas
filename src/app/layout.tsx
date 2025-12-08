import "./globals.css"
import type { Metadata } from "next"
import { FadeLayout } from "@/components/FadeLayout"

export const metadata: Metadata = {
  title: "Eonia Atlas",
  description: "A living world of maps, lore, and legends.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <FadeLayout>{children}</FadeLayout>
      </body>
    </html>
  )
}

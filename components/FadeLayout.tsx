"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"

export function FadeLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    // mark that the client has hydrated — subsequent navigations should animate
    // This update is intentionally done after mount to mark hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(true)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        // Avoid animating on the very first mount/hydration to prevent
        // a double fade caused by server -> client hydration + route enter.
        initial={hasHydrated ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

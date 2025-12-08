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
    <AnimatePresence mode="sync">
      <motion.div
        key={pathname}
        // Avoid animating on the very first mount/hydration to prevent
        // a double fade caused by server -> client hydration + route enter.
        initial={hasHydrated ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        // Remove the exit animation so the outgoing page does not fade to
        // transparent (which reveals the black body background). Keeping no
        // exit prevents the dark gap and lets the incoming page fade in over
        // the existing content.
        transition={{ duration: 0.45, ease: "easeInOut" }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

"use client"

import { motion, useInView } from "framer-motion"
import { ReactNode, useRef } from "react"

export function ScrollReveal({ children }: { children: ReactNode }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

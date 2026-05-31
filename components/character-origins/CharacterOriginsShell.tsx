"use client"

/**
 * Character Origins — client shell: intro gate and quiz phase container.
 * Sprint 2: intro + start flow. Sprint 3 replaces quiz placeholder with full questionnaire.
 */

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { useCallback, useState } from "react"
import { QUIZ_VERSION } from "@/lib/character-origins/constants"
import { getExpectedQuestionCount } from "@/lib/character-origins/questions"
import { CharacterOriginsQuizPlaceholder } from "./CharacterOriginsQuizPlaceholder"

type Phase = "intro" | "quiz"

export function CharacterOriginsShell() {
  const [phase, setPhase] = useState<Phase>("intro")
  const reduceMotion = useReducedMotion()

  const handleStart = useCallback(() => {
    setPhase("quiz")
  }, [])

  const handleBackToIntro = useCallback(() => {
    setPhase("intro")
  }, [])

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: "easeOut" as const }

  return (
    <div className="relative">
      {phase === "intro" ? (
        <motion.section
          key="intro"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="flex flex-col"
          aria-labelledby="origins-intro-heading"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-white/60">
            Mini-game
          </p>
          <h1
            id="origins-intro-heading"
            className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl"
          >
            Character Origins
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/75">
            Find a region that fits your character idea.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
            Answer a short questionnaire about your concept. We&apos;ll suggest a
            primary homeland across Glaudire, plus alternates grounded in the
            atlas — not guesses from thin air.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleStart}
              className="rounded-2xl border border-white/15 bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Yes, begin
            </button>
            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Not now
            </Link>
          </div>

          <p className="mt-8 text-xs text-white/40">
            {getExpectedQuestionCount()} questions · {QUIZ_VERSION}
          </p>
        </motion.section>
      ) : (
        <motion.div
          key="quiz"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
        >
          <CharacterOriginsQuizPlaceholder onBackToIntro={handleBackToIntro} />
        </motion.div>
      )}
    </div>
  )
}

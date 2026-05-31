"use client"

/**
 * Temporary quiz slot until Sprint 3 wires the full 10×3 questionnaire UI.
 */

import { getExpectedQuestionCount } from "@/lib/character-origins/questions"

type Props = {
  onBackToIntro: () => void
}

export function CharacterOriginsQuizPlaceholder({ onBackToIntro }: Props) {
  const total = getExpectedQuestionCount()

  return (
    <section aria-labelledby="origins-quiz-heading">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.25em] text-white/60">
          Questionnaire
        </p>
        <p className="text-xs text-white/45">
          0 / {total}
        </p>
      </div>
      <h2
        id="origins-quiz-heading"
        className="mt-3 text-2xl font-semibold tracking-tight"
      >
        Your answers are next
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65">
        The route and intro flow are live. The interactive question flow
        ({total} prompts, three choices each) will appear here in the next
        sprint — scoring already runs in{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/80">
          lib/character-origins
        </code>
        .
      </p>

      <div
        className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6"
        role="status"
      >
        <p className="text-sm text-white/50">
          Progress bar and choice buttons will mount in this panel.
        </p>
      </div>

      <button
        type="button"
        onClick={onBackToIntro}
        className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        Back to intro
      </button>
    </section>
  )
}

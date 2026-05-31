/**
 * Character Origins mini-game — server page shell (metadata + layout).
 * Interactive flow lives in components/character-origins/CharacterOriginsShell.tsx.
 */
import { CharacterOriginsShell } from "@/components/character-origins/CharacterOriginsShell"

export const metadata = {
  title: "Character Origins | Eonia Atlas",
  description:
    "Find a region in Glaudire that fits your character idea — a guided origin quiz grounded in Eonia lore.",
}

export default function CharacterOriginsPage() {
  return (
    <div className="mx-auto min-h-[70vh] max-w-3xl px-6 py-16">
      <CharacterOriginsShell />
    </div>
  )
}

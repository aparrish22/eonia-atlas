/**
 * Character Origins — quiz question graph (10 axes × 3 choices).
 * quizVersion: origins-v1-10x3. Player-safe copy only.
 */

import { regionBonuses, tagDeltas } from "./scoring"
import type { OriginChoice, OriginQuestion } from "./types"

function choice(
  questionId: string,
  letter: "a" | "b" | "c",
  shortLabel: string,
  label: string,
  tags: Record<string, number>,
  bonuses?: OriginChoice["regionBonuses"]
): OriginChoice {
  const letterId = letter as "a" | "b" | "c"
  return {
    id: `${questionId}-${letter}`,
    letter: letterId,
    shortLabel,
    label,
    tagDeltas: tagDeltas(tags),
    regionBonuses: bonuses,
  }
}

export const ORIGIN_QUESTIONS: readonly OriginQuestion[] = [
  {
    id: "q01-duty",
    order: 1,
    prompt: "What shaped your character's sense of obligation?",
    choices: [
      choice("q01-duty", "a", "Oathbound", "Sworn duty, service, and discipline.", {
        martial: 2,
        honor: 2,
        disciplined: 2,
      }),
      choice("q01-duty", "b", "Unbound", "Freedom, self-rule, and wandering.", {
        friendly: 2,
        survivors: 2,
        overseas: 2,
      }),
      choice("q01-duty", "c", "Pragmatic", "Duty when it serves the community — not the crown.", {
        republic: 2,
        gilded: 1,
        peaceful: 2,
      }),
    ],
  },
  {
    id: "q02-intrigue",
    order: 2,
    prompt: "Where does your character feel most at home politically?",
    choices: [
      choice("q02-intrigue", "a", "Intrigue", "Houses, secrets, and power plays.", {
        factionalized: 2,
        autocratic: 2,
        ascendancy: 2,
      }),
      choice("q02-intrigue", "b", "Frontier", "Borders, wild land, and hardship.", {
        frontier: 2,
        "hunters-gatherers": 2,
        ruins: 1,
      }),
      choice("q02-intrigue", "c", "Institution", "Academies, councils, and chartered power.", {
        magitech: 2,
        magocratic: 2,
        republic: 2,
      }),
    ],
  },
  {
    id: "q03-peace",
    order: 3,
    prompt: "How does your character relate to violence?",
    choices: [
      choice("q03-peace", "a", "Peace", "Pacifism, groves, and sanctuary.", {
        peaceful: 2,
        valley: 2,
        "nature-arts": 2,
        sanctuary: 2,
      }),
      choice("q03-peace", "b", "Conflict", "War, defense, and uprising.", {
        martial: 2,
        "brink-of-civil-war": 2,
        rebellion: 2,
        defenders: 1,
      }),
      choice("q03-peace", "c", "Guardian", "Fight only to protect home — not to conquer.", {
        defenders: 2,
        isolationist: 2,
        frontier: 2,
      }),
    ],
  },
  {
    id: "q04-trade",
    order: 4,
    prompt: "How open is your character's homeland to the outside world?",
    choices: [
      choice("q04-trade", "a", "Open", "Ports, markets, and republican trade.", {
        gilded: 2,
        magitech: 2,
        republic: 2,
        city: 1,
      }),
      choice("q04-trade", "b", "Closed", "Walls, snow, and keeping outsiders out.", {
        isolationist: 2,
        dwarven: 2,
        engineers: 2,
      }),
      choice("q04-trade", "c", "Neutral ground", "Diplomacy in valleys between great powers.", {
        peaceful: 2,
        valley: 2,
        lake: 2,
      }),
    ],
  },
  {
    id: "q05-arcane",
    order: 5,
    prompt: "What kind of power does your character respect most?",
    choices: [
      choice("q05-arcane", "a", "Arcane", "Magic, rings, and immortals.", {
        magocratic: 2,
        arcane: 2,
        aisarai: 2,
        immortals: 2,
      }),
      choice("q05-arcane", "b", "Craft", "Forge, mine, sail, and build.", {
        artificers: 2,
        engineers: 2,
        naval: 2,
        magitech: 1,
      }),
      choice("q05-arcane", "c", "Nature-arts", "Druidic and clerical craft tied to the land.", {
        "nature-arts": 2,
        peaceful: 2,
        sanctuary: 2,
      }),
    ],
  },
  {
    id: "q06-wilds",
    order: 6,
    prompt: "What landscape forged your character?",
    choices: [
      choice("q06-wilds", "a", "Wilds", "Monster-haunted ruins and ancient wilds.", {
        monsters: 2,
        ancient: 2,
        ruins: 2,
        survivors: 2,
      }),
      choice("q06-wilds", "b", "Heartland", "Kingdoms, settled valleys, and lakes.", {
        kingdom: 2,
        valley: 2,
        lake: 2,
      }),
      choice("q06-wilds", "c", "Borderland", "Between civilization and horror.", {
        frontier: 2,
        survivors: 2,
        monsters: 1,
      }),
    ],
  },
  {
    id: "q07-sea",
    order: 7,
    prompt: "What geography calls to your character?",
    choices: [
      choice("q07-sea", "a", "Sea", "Islands, pirates, and distant horizons.", {
        pirates: 2,
        overseas: 2,
        ships: 2,
        naval: 1,
      }),
      choice("q07-sea", "b", "Continent", "Desert, peaks, and inland empires.", {
        desert: 2,
        frontier: 2,
        ruins: 1,
      }),
      choice("q07-sea", "c", "Exile isle", "A small distant homeland — tree and guardians.", {
        immortals: 2,
        "world-tree": 2,
        defenders: 2,
      }),
    ],
  },
  {
    id: "q08-ally",
    order: 8,
    prompt: "How does your character stand among realms?",
    choices: [
      choice(
        "q08-ally",
        "a",
        "Ally",
        "Chivalry, nationalism, and allied realms.",
        { honor: 2, nationalism: 2, martial: 2 },
        regionBonuses({ astia: 4, reth: 3 })
      ),
      choice(
        "q08-ally",
        "b",
        "Outsider",
        "Immigrant, border wars, and secession.",
        { secessionist: 2, friendly: 2, rebellion: 2 },
        regionBonuses({ ikara: 5, astia: 1 })
      ),
      choice(
        "q08-ally",
        "c",
        "Broker",
        "Merchant, envoy, or sellsword between factions.",
        { gilded: 2, city: 2, republic: 2 },
        regionBonuses({ kircia: 3, lucia: 2 })
      ),
    ],
  },
  {
    id: "q09-memory",
    order: 9,
    prompt: "What sense of history drives your character?",
    choices: [
      choice("q09-memory", "a", "Ancient", "Centuries, the World Tree, and guardians.", {
        immortals: 2,
        "world-tree": 2,
        defenders: 2,
        ancient: 2,
      }),
      choice(
        "q09-memory",
        "b",
        "Ambition",
        "Profit, expeditions, and free desert cities.",
        { ruins: 2, desert: 2, capital: 2 },
        regionBonuses({ lucelus: 4 })
      ),
      choice(
        "q09-memory",
        "c",
        "Hunter's calling",
        "Monster-slayer tradition and old ruins.",
        { monsters: 2, survivors: 2, ancient: 2 },
        regionBonuses({ edezia: 4 })
      ),
    ],
  },
  {
    id: "q10-faith",
    order: 10,
    prompt: "What guides your character's moral compass?",
    choices: [
      choice("q10-faith", "a", "Faith", "Clerics, monks, and druids.", {
        "nature-arts": 2,
        sanctuary: 2,
        peaceful: 2,
      }),
      choice("q10-faith", "b", "Secular", "Merchants, soldiers, and engineers.", {
        republic: 2,
        gilded: 2,
        engineers: 2,
      }),
      choice("q10-faith", "c", "Old ways", "House rites and ancestral magic.", {
        ascendancy: 2,
        magocratic: 2,
        factionalized: 2,
      }),
    ],
  },
] as const

const questionById = new Map(ORIGIN_QUESTIONS.map((q) => [q.id, q]))
const choiceById = new Map<string, OriginChoice>()
for (const q of ORIGIN_QUESTIONS) {
  for (const c of q.choices) {
    choiceById.set(c.id, c)
  }
}

export function getOriginQuestions(): readonly OriginQuestion[] {
  return ORIGIN_QUESTIONS
}

export function getOriginQuestionById(id: string): OriginQuestion | undefined {
  return questionById.get(id)
}

export function getOriginChoiceById(choiceId: string): OriginChoice | undefined {
  return choiceById.get(choiceId)
}

export function getExpectedQuestionCount(): number {
  return ORIGIN_QUESTIONS.length
}

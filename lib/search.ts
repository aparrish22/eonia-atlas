/*
 * Server-side search over file-backed lore entries.
 * Inputs are plain query strings; outputs are ranked summaries linking to
 * `/lore/<category>/<slug>`. Keep this server-only because entries include
 * full Markdown bodies loaded from disk.
 */
import type { ContentEntry } from "@/lib/content"
import { getAllEntries } from "@/lib/content"

export type SearchResult = {
  category: string
  slug: string
  title: string
  href: string
  label: string
  excerpt: string
  tags: string[]
  score: number
}

const MAX_QUERY_LENGTH = 80
const SNIPPET_RADIUS = 90

export function searchEntries(rawQuery: string): SearchResult[] {
  const query = normalizeQuery(rawQuery)
  if (!query) return []

  const terms = query.split(" ").filter(Boolean)

  return getAllEntries()
    .map((entry) => scoreEntry(entry, query, terms))
    .filter((result): result is SearchResult => result !== null)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
}

export function normalizeQuery(rawQuery: string): string {
  return rawQuery.trim().toLowerCase().replace(/\s+/g, " ").slice(0, MAX_QUERY_LENGTH)
}

function scoreEntry(entry: ContentEntry, query: string, terms: string[]): SearchResult | null {
  const title = entry.frontmatter.title
  const tags = entry.frontmatter.tags ?? []
  const metadata = [
    title,
    entry.category,
    entry.frontmatter.type,
    entry.frontmatter.region,
    entry.frontmatter.excerpt,
    ...tags,
  ]
    .filter(Boolean)
    .join(" ")
  const body = stripMarkdown(entry.content)

  const normalizedTitle = title.toLowerCase()
  const normalizedMetadata = metadata.toLowerCase()
  const normalizedBody = body.toLowerCase()

  let score = 0
  if (normalizedTitle === query) score += 120
  if (normalizedTitle.includes(query)) score += 80
  if (normalizedMetadata.includes(query)) score += 45
  if (normalizedBody.includes(query)) score += 20

  for (const term of terms) {
    if (normalizedTitle.includes(term)) score += 12
    if (normalizedMetadata.includes(term)) score += 6
    if (normalizedBody.includes(term)) score += 2
  }

  if (score === 0) return null

  const excerpt = entry.frontmatter.excerpt?.trim() || makeSnippet(body, query, terms)
  const label = entry.frontmatter.region || entry.frontmatter.type || titleCase(entry.category)

  return {
    category: entry.category,
    slug: entry.slug,
    title,
    href: `/lore/${entry.category}/${entry.slug}`,
    label,
    excerpt,
    tags,
    score,
  }
}

function stripMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_~\-|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function makeSnippet(content: string, query: string, terms: string[]): string {
  const normalized = content.toLowerCase()
  const firstMatch = [query, ...terms]
    .map((term) => normalized.indexOf(term))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0]

  if (firstMatch === undefined) {
    return content.slice(0, SNIPPET_RADIUS * 2).trim()
  }

  const start = Math.max(0, firstMatch - SNIPPET_RADIUS)
  const end = Math.min(content.length, firstMatch + query.length + SNIPPET_RADIUS)
  const prefix = start > 0 ? "..." : ""
  const suffix = end < content.length ? "..." : ""

  return `${prefix}${content.slice(start, end).trim()}${suffix}`
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

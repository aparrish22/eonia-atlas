import Link from "next/link"
import { ScrollReveal } from "@/components/ScrollReveal"
import { normalizeQuery, searchEntries } from "@/lib/search"

type SearchPageProps = {
  searchParams?: Promise<{ q?: string | string[] }> | { q?: string | string[] }
}

export const metadata = {
  title: "Search | Eonia Atlas",
  description: "Search the lore, locations, characters, factions, and events of Eonia.",
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams
  const rawQuery = Array.isArray(resolvedSearchParams?.q)
    ? resolvedSearchParams.q[0] ?? ""
    : resolvedSearchParams?.q ?? ""
  const query = normalizeQuery(rawQuery)
  const results = query ? searchEntries(query) : []

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <ScrollReveal>
        <p className="text-xs uppercase tracking-[0.25em] text-white/60">
          Atlas Search
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Find lore across Eonia
        </h1>
        <p className="mt-4 max-w-2xl text-white/65">
          Search titles, tags, locations, factions, character pages, excerpts,
          and the body text of each encyclopedia entry.
        </p>

        <form action="/search" className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="search-page-query">
            Search lore
          </label>
          <input
            id="search-page-query"
            name="q"
            type="search"
            defaultValue={rawQuery}
            placeholder="Search Reyna, Azuria, Cloudless Eve..."
            className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/35 focus:bg-white/15"
          />
          <button
            type="submit"
            className="rounded-2xl border border-white/15 bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/85"
          >
            Search
          </button>
        </form>
      </ScrollReveal>

      <section className="mt-10">
        {!query ? (
          <EmptySearchState />
        ) : results.length > 0 ? (
          <SearchResults query={query} results={results} />
        ) : (
          <NoResultsState query={query} />
        )}
      </section>
    </main>
  )
}

function EmptySearchState() {
  return (
    <ScrollReveal>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/65">
        Enter a name, place, faction, tag, or phrase to search the atlas.
      </div>
    </ScrollReveal>
  )
}

function NoResultsState({ query }: { query: string }) {
  return (
    <ScrollReveal>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-medium">No results for “{query}”</h2>
        <p className="mt-2 text-sm text-white/60">
          Try a broader term, a character name, a region, or a tag from a lore page.
        </p>
      </div>
    </ScrollReveal>
  )
}

function SearchResults({
  query,
  results,
}: {
  query: string
  results: ReturnType<typeof searchEntries>
}) {
  return (
    <>
      <ScrollReveal>
        <p className="text-sm text-white/60">
          {results.length} {results.length === 1 ? "result" : "results"} for “{query}”
        </p>
      </ScrollReveal>

      <div className="mt-5 grid gap-4">
        {results.map((result) => (
          <ScrollReveal key={`${result.category}/${result.slug}`}>
            <Link
              href={result.href}
              className="block rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                    {result.category} · {result.label}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{result.title}</h2>
                </div>
                <span className="text-sm text-white/50">Open →</span>
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
                {result.excerpt}
              </p>

              {result.tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-white/55"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </>
  )
}

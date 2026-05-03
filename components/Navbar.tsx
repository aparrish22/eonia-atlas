/*
 * Global top navigation for the App Router shell.
 * Provides primary links plus a GET-based lore search form that submits to
 * `/search?q=...`, keeping the component server-rendered and dependency-free.
 */
import Link from "next/link"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/contact", label: "Contact" },
  { href: "/world-map", label: "World Map" },
  { href: "/maps", label: "Maps" },
]

export default function Navbar() {
  return (
    <nav className="border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-bold tracking-wide text-white">
            Eonia
          </Link>

          <div className="flex items-center md:hidden">
            <SearchForm compact />
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <SearchForm />
          </div>
        </div>
      </div>
    </nav>
  )
}

function SearchForm({ compact = false }: { compact?: boolean }) {
  return (
    <form action="/search" className="flex items-center gap-2">
      <label className="sr-only" htmlFor={compact ? "navbar-search-mobile" : "navbar-search"}>
        Search lore
      </label>
      <input
        id={compact ? "navbar-search-mobile" : "navbar-search"}
        name="q"
        type="search"
        placeholder={compact ? "Search" : "Search lore..."}
        className="h-9 w-32 rounded-full border border-white/10 bg-white/10 px-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/35 focus:bg-white/15 sm:w-44"
      />
      <button
        type="submit"
        className="h-9 rounded-full border border-white/15 bg-white/10 px-3 text-sm text-white/80 transition hover:bg-white/20 hover:text-white"
      >
        Go
      </button>
    </form>
  )
}

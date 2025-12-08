import fs from "fs"
import path from "path"
import matter from "gray-matter"

const CONTENT_DIR = path.join(process.cwd(), "content")

export type Frontmatter = {
  title: string
  type?: string
  region?: string
  order?: number
  cover?: string
  music?: string
  tags?: string[]
  excerpt?: string
}

export type ContentEntry = {
  category: string
  slug: string
  frontmatter: Frontmatter
  content: string
}

function readMdxFile(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf8")
  const { data, content } = matter(raw)
  return { data: data as Frontmatter, content }
}

export function getAllCategories(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((name) => {
      const full = path.join(CONTENT_DIR, name)
      return fs.statSync(full).isDirectory()
    })
}

export function getAllEntries(): ContentEntry[] {
  const categories = getAllCategories()
  const entries: ContentEntry[] = []

  for (const category of categories) {
    const dir = path.join(CONTENT_DIR, category)
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))

    for (const file of files) {
      const slug = file.replace(/\.mdx?$/, "")
      const full = path.join(dir, file)
      const { data, content } = readMdxFile(full)

      entries.push({
        category,
        slug,
        frontmatter: data,
        content,
      })
    }
  }

  return entries.sort((a, b) => (a.frontmatter.order ?? 999) - (b.frontmatter.order ?? 999))
}

export function getEntriesByCategory(category: string): ContentEntry[] {
  return getAllEntries().filter((e) => e.category === category)
}

export function getEntry(category: string, slug: string): ContentEntry | null {
  if (typeof category !== "string" || typeof slug !== "string") return null

  const full = path.join(CONTENT_DIR, category, `${slug}.mdx`)
  if (!fs.existsSync(full)) return null
  const { data, content } = readMdxFile(full)

  return { category, slug, frontmatter: data, content }
}

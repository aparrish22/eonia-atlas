import { MDXRemote } from "next-mdx-remote/rsc"

export function MdxRender({ source }: { source: string }) {
  return (
    <article className="prose prose-invert max-w-none">
      <MDXRemote source={source} />
    </article>
  )
}

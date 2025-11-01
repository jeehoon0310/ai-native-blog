import { notFound } from 'next/navigation'
import { getBlogPosts, DEFAULT_AUTHOR } from 'app/blog/utils'
import { BlogPosts } from 'app/components/posts'

export async function generateStaticParams() {
  let posts = getBlogPosts()
  let authors = new Set(
    posts
      .map((post) => {
        const author = post.metadata.author || DEFAULT_AUTHOR
        return author.name
      })
      .map((name) => name.toLowerCase().replace(/\s+/g, '-'))
  )

  return Array.from(authors).map((slug) => ({
    slug,
  }))
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const allPosts = getBlogPosts()

  // Filter posts by author slug
  const authorPosts = allPosts.filter((post) => {
    const author = post.metadata.author || DEFAULT_AUTHOR
    const authorSlug = author.name.toLowerCase().replace(/\s+/g, '-')
    return authorSlug === resolvedParams.slug
  })

  if (authorPosts.length === 0) {
    notFound()
  }

  const author = authorPosts[0].metadata.author || DEFAULT_AUTHOR
  const authorName = author.name

  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">
        Posts by {authorName}
      </h1>
      <BlogPosts posts={authorPosts} />
    </section>
  )
}

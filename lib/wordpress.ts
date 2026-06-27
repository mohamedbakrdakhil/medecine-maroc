import type { Chapter, CoursePage } from '@/lib/content/types'

type WordPressRendered = {
  rendered?: string
}

type WordPressCategory = {
  id: number
  slug: string
}

type WordPressPost = {
  id: number
  slug: string
  link?: string
  title?: WordPressRendered
  content?: WordPressRendered
  excerpt?: WordPressRendered
  _embedded?: {
    author?: Array<{ name?: string }>
  }
}

function getWordPressApiBase() {
  const configured = process.env.WORDPRESS_API_URL || process.env.WORDPRESS_URL
  if (!configured) return null

  const trimmed = configured.replace(/\/$/, '')
  if (trimmed.endsWith('/wp-json/wp/v2')) return trimmed
  if (trimmed.endsWith('/wp-json')) return `${trimmed}/wp/v2`
  return `${trimmed}/wp-json/wp/v2`
}

function stripHtml(value = '') {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&agrave;/g, 'à')
    .replace(/&ccedil;/g, 'ç')
    .replace(/\s+/g, ' ')
    .trim()
}

function getAttribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'))
  return match?.[1]
}

function extractImages(content = '', title: string): CoursePage[] {
  const pages: CoursePage[] = []
  const imgRegex = /<img\b[^>]*>/gi
  let match: RegExpExecArray | null

  while ((match = imgRegex.exec(content))) {
    const tag = match[0]
    const src = getAttribute(tag, 'src')
    if (!src) continue
    const alt = getAttribute(tag, 'alt') || `${title} - page ${pages.length + 1}`
    pages.push({ imageUrl: src, alt: stripHtml(alt) || `${title} - page ${pages.length + 1}` })
  }

  return pages
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

async function findCategoryId(apiBase: string, moduleId: string) {
  const slugs = [moduleId, `module-${moduleId}`, `medmaroc-${moduleId}`]

  for (const slug of slugs) {
    const url = `${apiBase}/categories?slug=${encodeURIComponent(slug)}&per_page=1`
    const categories = await fetchJson<WordPressCategory[]>(url)
    const category = categories?.[0]
    if (category?.id) return category.id
  }

  return null
}

export async function getWordPressChapters(moduleId: string): Promise<Chapter[]> {
  const apiBase = getWordPressApiBase()
  if (!apiBase) return []

  const categoryId = await findCategoryId(apiBase, moduleId)
  if (!categoryId) return []

  const url = `${apiBase}/posts?categories=${categoryId}&status=publish&per_page=100&orderby=date&order=asc&_embed=author`
  const posts = await fetchJson<WordPressPost[]>(url)
  if (!posts?.length) return []

  return posts.map((post): Chapter => {
    const title = stripHtml(post.title?.rendered) || `Support WordPress ${post.id}`
    const professor =
      stripHtml(post.excerpt?.rendered) ||
      post._embedded?.author?.[0]?.name ||
      'Admin WordPress'
    const sourcePages = extractImages(post.content?.rendered, title)

    return {
      id: `wordpress-${post.id}-${post.slug}`,
      title,
      professor,
      sourceUrl: post.link,
      sourceLabel: 'Ouvrir dans WordPress',
      sourcePages,
      sourcePagesTitle: 'Support WordPress',
      sourcePagesSubtitle: sourcePages.length
        ? `${sourcePages.length} pages ajoutées depuis WordPress`
        : 'Support ajouté depuis WordPress',
      keyPoints: [],
      sections: [],
    }
  })
}

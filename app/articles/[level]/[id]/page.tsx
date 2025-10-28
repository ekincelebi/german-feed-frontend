import { supabase } from '@/lib/supabase'
import { CEFR_LEVELS, type ArticleDetail } from '@/lib/types'
import ArticleReader from '@/components/ArticleReader'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ level: string; id: string }>
}

export default async function ArticleDetailPage({ params }: Props) {
  const { level, id } = await params

  const levelUpper = level.toUpperCase()

  // Validate level
  if (!CEFR_LEVELS.includes(levelUpper as any)) {
    notFound()
  }

  // Fetch article from Supabase
  const { data: article, error } = await supabase
    .from('article_detail_view')
    .select('*')
    .eq('id', id)
    .single()

  // Handle errors
  if (error || !article) {
    notFound()
  }

  // Verify article matches requested level
  if (article.language_level !== levelUpper) {
    notFound()
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href={`/articles/${level}`}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-6 inline-block"
        >
          ← Back to {levelUpper} Articles
        </Link>

        {/* Article Reader */}
        <ArticleReader article={article as ArticleDetail} level={level} />
      </div>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props) {
  const { id } = await params

  const { data: article } = await supabase
    .from('article_detail_view')
    .select('title, cleaned_content')
    .eq('id', id)
    .single()

  return {
    title: article?.title ? `${article.title} | German Learning` : 'Article',
    description: article?.cleaned_content?.substring(0, 160) || 'Read German articles',
  }
}

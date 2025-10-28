import { supabase } from '@/lib/supabase'
import { CEFR_LEVELS, type ArticleListItem } from '@/lib/types'
import ArticleCard from '@/components/ArticleCard'
import TopicFilter from '@/components/TopicFilter'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ level: string }>
  searchParams: Promise<{ topic?: string }>
}

export default async function ArticleListPage({ params, searchParams }: Props) {
  const { level } = await params
  const { topic } = await searchParams

  const levelUpper = level.toUpperCase()

  // Validate level
  if (!CEFR_LEVELS.includes(levelUpper as any)) {
    notFound()
  }

  // Build query
  let query = supabase
    .from('article_list_view')
    .select('*')
    .eq('language_level', levelUpper)
    .order('published_date', { ascending: false })

  // Apply topic filter if provided
  if (topic) {
    query = query.contains('topics', [topic])
  }

  const { data: articles, error } = await query.limit(50)

  if (error) {
    console.error('Error fetching articles:', error)
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Levels
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Level {levelUpper} Articles
          </h1>
          <p className="text-gray-600">
            {articles?.length || 0} articles available
            {topic && ` in "${topic}"`}
          </p>
        </div>

        {/* Topic Filter */}
        <TopicFilter level={level} />

        {/* Articles Grid */}
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article as ArticleListItem}
                level={level}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No articles found for this level
              {topic && ` with topic "${topic}"`}.
            </p>
            {topic && (
              <Link
                href={`/articles/${level}`}
                className="text-blue-600 hover:text-blue-700 font-medium mt-4 inline-block"
              >
                Clear filter
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

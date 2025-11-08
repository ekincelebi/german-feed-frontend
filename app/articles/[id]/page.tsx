import { supabase } from '@/lib/supabase'
import ArticleReader from '@/components/ArticleReader'
import { notFound } from 'next/navigation'
import type { LearningArticle } from '@/lib/types'

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Fetch single article with all learning data
  const { data: articleData, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      url,
      theme,
      created_at,
      processed_content(*),
      learning_enhancements(*)
    `)
    .eq('id', id)
    .single()

  if (error || !articleData) {
    console.error('Error fetching article:', error)
    notFound()
  }

  // Transform the data to match LearningArticle type
  const data = articleData as any
  const processedContent = Array.isArray(data.processed_content)
    ? data.processed_content[0]
    : data.processed_content

  const learningEnhancements = Array.isArray(data.learning_enhancements)
    ? data.learning_enhancements[0]
    : data.learning_enhancements

  const article: LearningArticle = {
    id: data.id,
    title: data.title,
    url: data.url,
    source_name: 'News Source', // Will be derived from URL or set by backend
    published_at: data.created_at, // Use created_at as published date
    theme: data.theme || null,
    created_at: data.created_at,
    processed_content: processedContent,
    learning_enhancements: learningEnhancements,
  }

  return <ArticleReader article={article} />
}

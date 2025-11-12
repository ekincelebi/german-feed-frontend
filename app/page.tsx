'use client'

import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/ArticleCard'
import type { LearningArticle } from '@/lib/types'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [selectedTheme, setSelectedTheme] = useState<string>('')
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [learningArticles, setLearningArticles] = useState<LearningArticle[]>([])
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const ARTICLES_PER_PAGE = 15

  // Load saved articles from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedArticles') || '[]')
    setSavedArticleIds(saved)
  }, [])

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true)
      setError(null)

      // Calculate date 7 days ago
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const sevenDaysAgoISO = sevenDaysAgo.toISOString()

      // Fetch articles with all learning enhancements from last 7 days
      const { data: articles, error: fetchError } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          url,
          created_at,
          theme,
          processed_content!inner(*),
          learning_enhancements!inner(*)
        `)
        .gte('created_at', sevenDaysAgoISO)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching articles:', fetchError)
        setError(fetchError.message)
        setLoading(false)
        return
      }

      // Transform the data to match LearningArticle type
      const transformed: LearningArticle[] = articles?.map((article: any) => {
        const processedContent = Array.isArray(article.processed_content)
          ? article.processed_content[0]
          : article.processed_content

        const learningEnhancements = Array.isArray(article.learning_enhancements)
          ? article.learning_enhancements[0]
          : article.learning_enhancements

        return {
          id: article.id,
          title: article.title,
          url: article.url,
          source_name: 'News Source', // Will be derived from URL or set by backend
          published_at: article.created_at, // Use created_at as published date
          theme: article.theme || null,
          created_at: article.created_at,
          processed_content: processedContent,
          learning_enhancements: learningEnhancements,
        }
      }) || []

      setLearningArticles(transformed)
      setLoading(false)
    }

    fetchArticles()
  }, [])

  // Listen for storage changes to update saved articles list
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = JSON.parse(localStorage.getItem('savedArticles') || '[]')
      setSavedArticleIds(saved)
    }

    window.addEventListener('storage', handleStorageChange)

    // Also listen for custom events from ArticleCard
    const handleSavedUpdate = () => {
      const saved = JSON.parse(localStorage.getItem('savedArticles') || '[]')
      setSavedArticleIds(saved)
    }

    window.addEventListener('savedArticlesUpdated', handleSavedUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('savedArticlesUpdated', handleSavedUpdate)
    }
  }, [])

  // Theme display mapping
  const themeDisplayMap: Record<string, string> = {
    'idioms': 'Idioms',
    'general_news': 'General News',
    'international_news': 'International News',
    'business': 'Business',
    'culture': 'Culture',
    'health': 'Health',
    'recipes': 'Recipes',
    'science': 'Science',
    'technology': 'Technology'
  }

  // Extract unique themes from articles
  const uniqueThemes = Array.from(
    new Set(
      learningArticles
        .map(article => article.theme)
        .filter((theme): theme is string => theme !== null && theme !== '')
    )
  ).sort()

  const themes = ['All', ...uniqueThemes]

  // Apply filters
  let filteredArticles = learningArticles

  // Filter by saved status
  if (showSavedOnly) {
    filteredArticles = filteredArticles.filter(article => savedArticleIds.includes(article.id))
  }

  // Filter by theme
  if (selectedTheme && selectedTheme !== 'All') {
    filteredArticles = filteredArticles.filter(article => article.theme === selectedTheme)
  }

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE)
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE
  const endIndex = startIndex + ARTICLES_PER_PAGE
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedTheme, showSavedOnly])

  const getThemeDisplay = (theme: string): string => {
    if (theme === 'All') return 'All'
    return themeDisplayMap[theme] || theme
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading articles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error loading articles</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            German Reading Practice
          </h1>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <div className="flex gap-3 flex-wrap justify-center items-center">
            {/* Theme Filters */}
            {themes.map((theme) => (
              <button
                key={theme}
                onClick={() => setSelectedTheme(theme === 'All' ? '' : theme)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  (selectedTheme === '' && theme === 'All') || selectedTheme === theme
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                {getThemeDisplay(theme)}
              </button>
            ))}

            {/* Divider */}
            <div className="h-8 w-px bg-gray-300 mx-2"></div>

            {/* Saved Filter */}
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`px-6 py-2 rounded-full font-medium transition-all inline-flex items-center gap-2 ${
                showSavedOnly
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-amber-400 hover:shadow-sm'
              }`}
            >
              <svg className="w-5 h-5" fill={showSavedOnly ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>{showSavedOnly ? 'Saved' : 'Saved'}</span>
            </button>
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No articles found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-sm disabled:hover:border-gray-200"
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-sm disabled:hover:border-gray-200"
                >
                  Next
                </button>
              </div>
            )}

            {/* Article count info */}
            <div className="text-center mt-4 text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredArticles.length)} of {filteredArticles.length} articles
            </div>
          </>
        )}
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import type { ArticleListItem } from '@/lib/types'
import { Bookmark, Check } from 'lucide-react'
import { useState, useEffect } from 'react'

type ArticleCardProps = {
  article: ArticleListItem
  level: string
}

export default function ArticleCard({ article, level }: ArticleCardProps) {
  const [isRead, setIsRead] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    // Load states from localStorage
    const readArticles = JSON.parse(localStorage.getItem('readArticles') || '[]')
    const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]')

    setIsRead(readArticles.includes(article.id))
    setIsSaved(savedArticles.includes(article.id))
  }, [article.id])

  const toggleRead = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const readArticles = JSON.parse(localStorage.getItem('readArticles') || '[]')
    const newReadState = !isRead

    if (newReadState) {
      readArticles.push(article.id)
    } else {
      const index = readArticles.indexOf(article.id)
      if (index > -1) readArticles.splice(index, 1)
    }

    localStorage.setItem('readArticles', JSON.stringify(readArticles))
    setIsRead(newReadState)
  }

  const toggleSaved = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]')
    const newSavedState = !isSaved

    if (newSavedState) {
      savedArticles.push(article.id)
    } else {
      const index = savedArticles.indexOf(article.id)
      if (index > -1) savedArticles.splice(index, 1)
    }

    localStorage.setItem('savedArticles', JSON.stringify(savedArticles))
    setIsSaved(newSavedState)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-200 relative">
      {/* Status Icons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={toggleSaved}
          className={`p-2 rounded-lg transition-colors ${
            isSaved
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
          title={isSaved ? 'Saved' : 'Save article'}
        >
          <Bookmark className="h-5 w-5" fill={isSaved ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={toggleRead}
          className={`p-2 rounded-lg transition-colors ${
            isRead
              ? 'bg-green-100 text-green-600 hover:bg-green-200'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
          title={isRead ? 'Marked as read' : 'Mark as read'}
        >
          <Check className="h-5 w-5" strokeWidth={isRead ? 3 : 2} />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2 pr-24">
        {article.title}
      </h3>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700 mb-3 font-medium">
        <span>{article.source_domain}</span>
        <span>•</span>
        <span>{formatDate(article.published_date)}</span>
        <span>•</span>
        <span>{article.word_count_after} words</span>
      </div>

      {/* Topics */}
      {article.topics && article.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {article.topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full"
            >
              {topic}
            </span>
          ))}
          {article.topics.length > 3 && (
            <span className="px-3 py-1 text-xs font-semibold text-gray-600">
              +{article.topics.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Read Button */}
      <Link
        href={`/articles/${level}/${article.id}`}
        className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
      >
        Read Article
      </Link>
    </div>
  )
}

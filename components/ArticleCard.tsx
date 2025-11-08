'use client'

import Link from 'next/link'
import type { LearningArticle } from '@/lib/types'
import { Bookmark, Check, Clock, BookOpen } from 'lucide-react'
import { useState, useEffect } from 'react'

type ArticleCardProps = {
  article: LearningArticle
}

const difficultyColors = {
  'A2': 'bg-green-100 text-green-800 border-green-200',
  'B1': 'bg-blue-100 text-blue-800 border-blue-200',
  'B2': 'bg-orange-100 text-orange-800 border-orange-200',
  'C1': 'bg-red-100 text-red-800 border-red-200',
  'C2': 'bg-purple-100 text-purple-800 border-purple-200',
}

export default function ArticleCard({ article }: ArticleCardProps) {
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

    // Dispatch custom event to notify HomePage
    window.dispatchEvent(new Event('savedArticlesUpdated'))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const difficulty = article.learning_enhancements.estimated_difficulty
  const readingTime = article.learning_enhancements.estimated_reading_time

  return (
    <Link href={`/articles/${article.id}`}>
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-200 relative h-full flex flex-col">
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

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold border rounded-full ${difficultyColors[difficulty]}`}>
            <BookOpen className="h-3 w-3" />
            {difficulty}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200 rounded-full">
            <Clock className="h-3 w-3" />
            {readingTime} min
          </span>
          {article.theme && (
            <span className="px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 rounded-full">
              {article.theme}
            </span>
          )}
        </div>

        {/* Source & Date */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-4">
          <span className="font-medium">{article.source_name}</span>
          <span>•</span>
          <span>{formatDate(article.published_at)}</span>
        </div>

        {/* Preview Text */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3 flex-grow">
          {article.processed_content.summary || article.processed_content.cleaned_content.substring(0, 150) + '...'}
        </p>
      </div>
    </Link>
  )
}

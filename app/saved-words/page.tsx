'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bookmark } from 'lucide-react'

export default function SavedWordsPage() {
  const [savedWordsCount, setSavedWordsCount] = useState(0)

  useEffect(() => {
    // Count total saved words across all articles
    let totalCount = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('savedWords_')) {
        const words = JSON.parse(localStorage.getItem(key) || '[]')
        totalCount += words.length
      }
    }
    setSavedWordsCount(totalCount)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Link>

        {/* Header */}
        <header className="bg-white border-2 border-gray-200 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Bookmark className="h-8 w-8 text-green-600" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Saved Words
              </h1>
            </div>
          </div>
        </header>

        {/* Empty State */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-12">
          <div className="text-center">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bookmark className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {savedWordsCount === 0 ? 'No saved words yet' : 'Coming Soon'}
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              {savedWordsCount === 0
                ? 'Start reading articles and save words you want to review. Click the bookmark icon next to any word explanation to save it.'
                : 'The full saved words interface is under construction. Your saved words are stored and will be displayed here soon!'}
            </p>
            {savedWordsCount === 0 && (
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Browse Articles
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

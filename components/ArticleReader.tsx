'use client'

import { useState, useEffect } from 'react'
import type { ArticleDetail, VocabularyWord } from '@/lib/types'
import VocabularyPopup from './VocabularyPopup'
import GrammarSidebar from './GrammarSidebar'
import { Play, Bookmark, ThumbsUp, ThumbsDown, Check } from 'lucide-react'

type ArticleReaderProps = {
  article: ArticleDetail
  level: string
}

function highlightVocabulary(content: string, vocabulary: VocabularyWord[]): { content: string; vocabMap: Map<number, VocabularyWord> } {
  let highlightedContent = content
  const vocabMap = new Map<number, VocabularyWord>()
  let markerId = 0

  // Sort vocabulary by word length (longest first) to avoid partial matches
  const sortedVocab = [...vocabulary].sort((a, b) => b.word.length - a.word.length)

  sortedVocab.forEach((vocab) => {
    // Escape special regex characters
    const escapedWord = vocab.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Match whole words only, case-insensitive
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi')

    // Replace with highlighted version and map to vocab entry
    highlightedContent = highlightedContent.replace(regex, (match) => {
      const id = markerId++
      vocabMap.set(id, vocab)
      return `<mark data-vocab-id="${id}">${match}</mark>`
    })
  })

  return { content: highlightedContent, vocabMap }
}

export default function ArticleReader({ article, level }: ArticleReaderProps) {
  const [selectedVocab, setSelectedVocab] = useState<VocabularyWord | null>(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [isRead, setIsRead] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const { content: highlightedContent, vocabMap } = highlightVocabulary(article.cleaned_content, article.vocabulary)

  // Load states from localStorage
  useEffect(() => {
    const readArticles = JSON.parse(localStorage.getItem('readArticles') || '[]')
    const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]')

    setIsRead(readArticles.includes(article.id))
    setIsSaved(savedArticles.includes(article.id))
  }, [article.id])

  const toggleRead = () => {
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

  const toggleSaved = () => {
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

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement

    if (target.tagName === 'MARK' && target.dataset.vocabId) {
      const id = parseInt(target.dataset.vocabId)
      const vocab = vocabMap.get(id)

      if (vocab) {
        setSelectedVocab(vocab)
        setPopupPosition({
          x: e.clientX,
          y: e.clientY,
        })
      }
    } else {
      setSelectedVocab(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {article.language_level}
          </span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span className="font-medium">{article.source_domain}</span>
          {article.author && (
            <>
              <span>•</span>
              <span>{article.author}</span>
            </>
          )}
          <span>•</span>
          <span>{formatDate(article.published_date)}</span>
          <span>•</span>
          <span>{article.word_count_after} words</span>
        </div>

        {/* Topics */}
        {article.topics && article.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.topics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Article Controls */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {/* Listen Button */}
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
            <Play className="h-5 w-5" />
            <span className="text-sm">Anhören</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={toggleSaved}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              isSaved
                ? 'text-blue-600 hover:text-blue-700'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <Bookmark className="h-5 w-5" fill={isSaved ? 'currentColor' : 'none'} />
            <span className="text-sm">{isSaved ? 'Gemerkt' : 'Merken'}</span>
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-300"></div>

          {/* Like Button */}
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors">
            <ThumbsUp className="h-5 w-5" />
            <span className="text-sm">Gefällt mir</span>
          </button>

          {/* Dislike Button */}
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 font-medium transition-colors">
            <ThumbsDown className="h-5 w-5" />
            <span className="text-sm">Gefällt mir nicht</span>
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-300"></div>

          {/* Mark as Read Button */}
          <button
            onClick={toggleRead}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              isRead
                ? 'text-green-600 hover:text-green-700'
                : 'text-gray-700 hover:text-green-600'
            }`}
          >
            <Check className="h-5 w-5" strokeWidth={isRead ? 3 : 2} />
            <span className="text-sm">{isRead ? 'Gelesen' : 'Als gelesen markieren'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Article Content */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                💡 <strong>Tip:</strong> Click on highlighted words to see translations
              </p>
            </div>

            <article
              onClick={handleContentClick}
              dangerouslySetInnerHTML={{ __html: highlightedContent }}
              className="prose prose-lg max-w-none
                prose-p:text-gray-900
                prose-p:leading-relaxed prose-p:mb-4
                cursor-text"
            />
          </div>

          {/* Source Link */}
          <div className="mt-6">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View Original Article →
            </a>
          </div>
        </div>

        {/* Grammar Sidebar */}
        <div className="lg:col-span-1">
          <GrammarSidebar grammarPatterns={article.grammar_patterns} />
        </div>
      </div>

      {/* Vocabulary Popup */}
      {selectedVocab && (
        <VocabularyPopup
          vocab={selectedVocab}
          position={popupPosition}
          onClose={() => setSelectedVocab(null)}
        />
      )}
    </div>
  )
}

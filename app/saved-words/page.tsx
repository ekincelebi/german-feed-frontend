'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bookmark, X, GripVertical } from 'lucide-react'

interface SavedWord {
  id: string
  word: string
  meaning: string
  grammar: string
  example: string
  articleId: string
  color: string
  savedAt: number
}

export default function SavedWordsPage() {
  const [savedWords, setSavedWords] = useState<SavedWord[]>([])
  const [selectedWord, setSelectedWord] = useState<SavedWord | null>(null)
  const [isDragMode, setIsDragMode] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    loadSavedWords()
  }, [])

  const loadSavedWords = () => {
    const allSavedWords: SavedWord[] = []

    // Iterate through all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)

      // Find highlights for each article
      if (key && key.startsWith('highlights_')) {
        const articleId = key.replace('highlights_', '')
        const highlights = JSON.parse(localStorage.getItem(key) || '[]')

        // Get saved word IDs for this article
        const savedWordsKey = `savedWords_${articleId}`
        const savedWordIds = JSON.parse(localStorage.getItem(savedWordsKey) || '[]')

        // Filter highlights that are saved
        const savedHighlights = highlights.filter((h: any) =>
          savedWordIds.includes(h.id) && h.explanation
        )

        // Add to our collection with metadata
        savedHighlights.forEach((h: any, index: number) => {
          allSavedWords.push({
            id: h.id,
            word: h.explanation.word || h.text,
            meaning: h.explanation.meaning,
            grammar: h.explanation.grammar,
            example: h.explanation.example,
            articleId: articleId,
            color: h.color,
            savedAt: Date.now() - (savedHighlights.length - index) // Approximate order
          })
        })
      }
    }

    // Check if we have a custom order saved
    const customOrder = localStorage.getItem('savedWordsOrder')
    if (customOrder) {
      const orderArray = JSON.parse(customOrder)
      // Sort by custom order
      allSavedWords.sort((a, b) => {
        const aIndex = orderArray.indexOf(a.id)
        const bIndex = orderArray.indexOf(b.id)
        // If not found in custom order, put at end
        if (aIndex === -1 && bIndex === -1) return a.savedAt - b.savedAt
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
    } else {
      // Sort by saved order (earliest first)
      allSavedWords.sort((a, b) => a.savedAt - b.savedAt)
    }

    setSavedWords(allSavedWords)
  }

  const saveWordsOrder = (words: SavedWord[]) => {
    const orderArray = words.map(w => w.id)
    localStorage.setItem('savedWordsOrder', JSON.stringify(orderArray))
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newWords = [...savedWords]
    const draggedWord = newWords[draggedIndex]
    newWords.splice(draggedIndex, 1)
    newWords.splice(index, 0, draggedWord)

    setSavedWords(newWords)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    saveWordsOrder(savedWords)
  }

  const formatText = (text: string) => {
    if (!text) return null

    const parts: React.ReactNode[] = []
    let lastIndex = 0

    const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
    let match

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index)
        parts.push(...beforeText.split('\n').flatMap((line, i, arr) =>
          i < arr.length - 1 ? [line, <br key={`br-${lastIndex}-${i}`} />] : [line]
        ))
      }

      const matchedText = match[0]

      if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
        const boldText = matchedText.slice(2, -2)
        parts.push(<strong key={`bold-${match.index}`} className="font-bold">{boldText}</strong>)
      } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
        const italicText = matchedText.slice(1, -1)
        parts.push(<em key={`italic-${match.index}`} className="italic">{italicText}</em>)
      }

      lastIndex = pattern.lastIndex
    }

    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex)
      parts.push(...remainingText.split('\n').flatMap((line, i, arr) =>
        i < arr.length - 1 ? [line, <br key={`br-end-${i}`} />] : [line]
      ))
    }

    return <>{parts}</>
  }

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
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Bookmark className="h-8 w-8 text-green-600" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Saved Words
                </h1>
                <p className="text-gray-600 mt-2">
                  Review and manage your saved vocabulary
                </p>
              </div>
            </div>
            {savedWords.length > 0 && (
              <button
                onClick={() => setIsDragMode(!isDragMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-all inline-flex items-center gap-2 ${
                  isDragMode
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <GripVertical className="h-5 w-5" />
                {isDragMode ? 'Done Reordering' : 'Reorder Words'}
              </button>
            )}
          </div>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-4">
            <p className="text-green-900 font-semibold">
              {savedWords.length} {savedWords.length === 1 ? 'word' : 'words'} saved
            </p>
          </div>
        </header>

        {/* Words Grid or Empty State */}
        {savedWords.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-12">
            <div className="text-center">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No saved words yet
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Start reading articles and save words you want to review. Click the bookmark icon next to any word explanation to save it.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Browse Articles
              </Link>
            </div>
          </div>
        ) : (
          <>
            {isDragMode && (
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 mb-4">
                <p className="text-indigo-900 font-medium text-center">
                  <GripVertical className="inline h-5 w-5 mr-2" />
                  Drag and drop cards to reorder your saved words
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {savedWords.map((word, index) => (
                <div
                  key={word.id}
                  draggable={isDragMode}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => !isDragMode && setSelectedWord(word)}
                  className={`bg-white border-2 border-gray-200 rounded-lg p-6 transition-all group ${
                    isDragMode
                      ? 'cursor-move hover:border-indigo-400 hover:shadow-md'
                      : 'cursor-pointer hover:shadow-lg hover:border-green-300'
                  } ${draggedIndex === index ? 'opacity-50' : ''}`}
                  style={{ borderLeftWidth: '4px', borderLeftColor: word.color }}
                >
                  <div className="text-center">
                    {isDragMode && (
                      <div className="flex justify-center mb-2">
                        <GripVertical className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <p className={`text-lg font-bold transition-colors ${
                      isDragMode
                        ? 'text-gray-900'
                        : 'text-gray-900 group-hover:text-green-600'
                    }`}>
                      {word.word}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Popup Modal */}
        {selectedWord && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedWord(null)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-green-100 border-b-2 border-green-200 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="px-4 py-2 rounded-lg font-bold text-lg"
                    style={{ backgroundColor: selectedWord.color }}
                  >
                    {selectedWord.word}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                {/* Meaning */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-blue-900 mb-2">
                    💬 Meaning
                  </div>
                  <div className="text-base text-gray-700">
                    {formatText(selectedWord.meaning)}
                  </div>
                </div>

                {/* Grammar */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-purple-900 mb-2">
                    ✨ Grammar
                  </div>
                  <div className="text-base text-gray-700">
                    {formatText(selectedWord.grammar)}
                  </div>
                </div>

                {/* Example */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-green-900 mb-2">
                    📖 Example Sentence
                  </div>
                  <div className="text-base text-gray-700 italic">
                    {formatText(selectedWord.example)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

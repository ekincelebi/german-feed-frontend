'use client'

import { useState, useEffect, useRef } from 'react'
import type { LearningArticle } from '@/lib/types'
import { Play, Pause, Bookmark, Check, Clock, BookOpen, ArrowLeft, X } from 'lucide-react'
import Link from 'next/link'

type ArticleReaderProps = {
  article: LearningArticle
}

export interface Highlight {
  id: string
  text: string
  color: string
  startIndex: number
  endIndex: number
  explanation?: {
    word: string
    meaning: string
    grammar: string
    example: string
  }
}

const difficultyColors = {
  'A2': 'bg-green-100 text-green-800',
  'B1': 'bg-blue-100 text-blue-800',
  'B2': 'bg-orange-100 text-orange-800',
  'C1': 'bg-red-100 text-red-800',
  'C2': 'bg-purple-100 text-purple-800',
}

const highlightColors = [
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bae6fd' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Purple', value: '#e9d5ff' },
  { name: 'Orange', value: '#fed7aa' },
]

export default function ArticleReader({ article }: ArticleReaderProps) {
  const [isRead, setIsRead] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Highlighting state
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [showExplanations, setShowExplanations] = useState(false)
  const [isLoadingExplanations, setIsLoadingExplanations] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const articleContent = article.processed_content.cleaned_content

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


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayAudio = async () => {
    // If audio is already playing, pause it
    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    // If we already have audio loaded, just play it
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play()
      setIsPlaying(true)
      return
    }

    // Otherwise, fetch the audio from the API
    try {
      setIsLoadingAudio(true)

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: article.processed_content.cleaned_content,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate audio')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Create audio element
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration)
      })

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime)
      })

      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        setCurrentTime(0)
      })

      audio.addEventListener('play', () => {
        setIsPlaying(true)
      })

      audio.addEventListener('pause', () => {
        setIsPlaying(false)
      })

      // Play the audio
      await audio.play()
      setIsPlaying(true)
    } catch (error) {
      console.error('Error playing audio:', error)
      alert('Failed to generate audio. Please try again.')
    } finally {
      setIsLoadingAudio(false)
    }
  }

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  // Highlighting handlers
  const handleColorClick = (color: string) => {
    if (selectedColor === color) {
      setSelectedColor('')
    } else {
      setSelectedColor(color)
    }
  }

  const handleMouseUp = () => {
    if (!selectedColor) return

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    const selectedText = selection.toString()
    if (!selectedText || !selectedText.trim()) return

    const range = selection.getRangeAt(0)
    const preSelectionRange = range.cloneRange()

    if (!contentRef.current) return

    preSelectionRange.selectNodeContents(contentRef.current)
    preSelectionRange.setEnd(range.startContainer, range.startOffset)

    const startIndex = preSelectionRange.toString().length
    const endIndex = startIndex + selectedText.length

    // Check for overlaps
    const overlaps = highlights.some(h =>
      (startIndex >= h.startIndex && startIndex < h.endIndex) ||
      (endIndex > h.startIndex && endIndex <= h.endIndex) ||
      (startIndex <= h.startIndex && endIndex >= h.endIndex)
    )

    if (overlaps) {
      alert('This selection overlaps with an existing highlight!')
      selection.removeAllRanges()
      return
    }

    const newHighlight: Highlight = {
      id: `highlight-${Date.now()}`,
      text: selectedText.trim(),
      color: selectedColor,
      startIndex,
      endIndex,
    }

    setHighlights([...highlights, newHighlight])
    selection.removeAllRanges()
  }

  const handleRemoveHighlight = (id: string) => {
    setHighlights(highlights.filter(h => h.id !== id))
  }

  const handleNavigateToHighlight = (highlightId: string) => {
    const element = document.getElementById(highlightId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.classList.add('animate-pulse')
      setTimeout(() => {
        element.classList.remove('animate-pulse')
      }, 1000)
    }
  }

  const handleExplainClick = async () => {
    // Count highlights without explanations
    const highlightsNeedingExplanations = highlights.filter(h => !h.explanation)

    if (highlights.length === 0) {
      alert('Please highlight some text first!')
      return
    }

    // If no new highlights to process, just toggle the panel
    if (highlightsNeedingExplanations.length === 0) {
      setShowExplanations(!showExplanations)
      return
    }

    // Process new explanations
    setIsLoadingExplanations(true)

    // Show the panel if it's not already visible
    if (!showExplanations) {
      setShowExplanations(true)
    }

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: articleContent,
          phrases: highlightsNeedingExplanations.map(h => h.text)
        })
      })

      if (!response.ok) throw new Error('Failed to get explanations')

      const explanations = await response.json()

      // Update only the highlights that didn't have explanations
      setHighlights(highlights.map(h => {
        if (!h.explanation) {
          const exp = explanations.find((e: any) => e.phrase === h.text)
          if (exp) {
            return { ...h, explanation: exp.explanation }
          }
        }
        return h
      }))
    } catch (error) {
      console.error('Error getting explanations:', error)
      alert('Failed to get explanations. Please try again.')
    } finally {
      setIsLoadingExplanations(false)
    }
  }

  // Format text with markdown-like syntax (bold, italic)
  const formatText = (text: string) => {
    if (!text) return null

    const parts: React.ReactNode[] = []
    let lastIndex = 0

    // Pattern to match **bold**, *italic*, and newlines
    const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
    let match

    while ((match = pattern.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index)
        parts.push(...beforeText.split('\n').flatMap((line, i, arr) =>
          i < arr.length - 1 ? [line, <br key={`br-${lastIndex}-${i}`} />] : [line]
        ))
      }

      const matchedText = match[0]

      // Handle **bold**
      if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
        const boldText = matchedText.slice(2, -2)
        parts.push(<strong key={`bold-${match.index}`} className="font-bold">{boldText}</strong>)
      }
      // Handle *italic*
      else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
        const italicText = matchedText.slice(1, -1)
        parts.push(<em key={`italic-${match.index}`} className="italic">{italicText}</em>)
      }

      lastIndex = pattern.lastIndex
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex)
      parts.push(...remainingText.split('\n').flatMap((line, i, arr) =>
        i < arr.length - 1 ? [line, <br key={`br-end-${i}`} />] : [line]
      ))
    }

    return <>{parts}</>
  }

  const renderHighlightedText = () => {
    if (highlights.length === 0) {
      return articleContent
    }

    const sortedHighlights = [...highlights].sort((a, b) => a.startIndex - b.startIndex)
    const elements: React.ReactElement[] = []
    let lastIndex = 0

    sortedHighlights.forEach((highlight, idx) => {
      if (highlight.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>
            {articleContent.substring(lastIndex, highlight.startIndex)}
          </span>
        )
      }

      elements.push(
        <mark
          key={highlight.id}
          id={highlight.id}
          className="relative group rounded-sm transition-all cursor-pointer hover:opacity-80"
          style={{
            backgroundColor: highlight.color,
            padding: 0,
            margin: 0
          }}
          onClick={(e) => {
            e.stopPropagation()
            handleRemoveHighlight(highlight.id)
          }}
          title="Click to remove highlight"
        >
          {highlight.text}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRemoveHighlight(highlight.id)
            }}
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-0.5 z-10"
            title="Remove highlight"
          >
            <X className="w-3 h-3" />
          </button>
        </mark>
      )

      lastIndex = highlight.endIndex
    })

    if (lastIndex < articleContent.length) {
      elements.push(
        <span key="text-end">
          {articleContent.substring(lastIndex)}
        </span>
      )
    }

    return elements
  }

  const difficulty = article.learning_enhancements.estimated_difficulty
  const readingTime = article.learning_enhancements.estimated_reading_time

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
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${difficultyColors[difficulty]}`}>
              <BookOpen className="h-4 w-4" />
              {difficulty}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold bg-gray-100 text-gray-800 rounded-full">
              <Clock className="h-4 w-4" />
              {readingTime} min
            </span>
            {article.theme && (
              <span className="px-3 py-1 text-sm font-semibold bg-purple-100 text-purple-800 rounded-full">
                {article.theme}
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span className="font-medium">{article.source_name}</span>
            <span>•</span>
            <span>{formatDate(article.published_at)}</span>
          </div>
        </header>

        {/* Article Controls */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {/* Listen Button */}
            <button
              onClick={handlePlayAudio}
              disabled={isLoadingAudio}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full font-medium transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoadingAudio ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Lädt...</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="h-5 w-5" />
                  <span className="text-sm">Hören {formatTime(currentTime)}</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span className="text-sm">Hören {audioDuration > 0 ? formatTime(audioDuration) : ''}</span>
                </>
              )}
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

        {/* Color Selector and Explain Button */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <label className="block mb-3 text-gray-700 font-medium">
                Select Highlight Color: {!selectedColor && <span className="text-gray-500 text-sm font-normal">(No color selected)</span>}
              </label>
              <div className="flex flex-wrap gap-3">
                {highlightColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorClick(color.value)}
                    className="relative group"
                    title={color.name}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        selectedColor === color.value
                          ? 'border-indigo-600 scale-110 shadow-lg'
                          : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                    >
                      {selectedColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-6 h-6 text-gray-700" />
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <button
                onClick={handleExplainClick}
                disabled={isLoadingExplanations}
                className={`min-w-[220px] px-6 py-3 rounded-lg font-medium transition-all ${
                  showExplanations
                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoadingExplanations ? (
                  <>
                    <div className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Loading...
                  </>
                ) : (() => {
                  const withoutExplanations = highlights.filter(h => !h.explanation).length
                  const withExplanations = highlights.filter(h => h.explanation).length

                  if (highlights.length === 0) {
                    return 'Show Explanations (0)'
                  } else if (withoutExplanations === 0 && withExplanations > 0) {
                    return showExplanations ? 'Hide Explanations' : `Show Explanations (${withExplanations})`
                  } else if (withExplanations === 0) {
                    return `Explain ${withoutExplanations} highlight${withoutExplanations > 1 ? 's' : ''}`
                  } else {
                    return `Add ${withoutExplanations} more explanation${withoutExplanations > 1 ? 's' : ''}`
                  }
                })()}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Article Text */}
          <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden h-[700px] flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-indigo-900">Learning Article</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <article
                ref={contentRef}
                onMouseUp={handleMouseUp}
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap select-text"
                style={{ userSelect: 'text' }}
              >
                {renderHighlightedText()}
              </article>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500">
                💡 Tip: {selectedColor ? 'Select any word or phrase to highlight it with the chosen color' : 'Choose a color above to start highlighting text'}
              </p>
              <div className="mt-2">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1"
                >
                  View Original Article →
                </a>
              </div>
            </div>
          </div>

          {/* Explanation Panel */}
          <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden h-[700px] flex flex-col">
            {showExplanations ? (
              <>
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl font-bold text-indigo-900">Explanations</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {highlights.filter(h => h.explanation).length} {highlights.filter(h => h.explanation).length === 1 ? 'explanation' : 'explanations'}
                    {highlights.filter(h => !h.explanation).length > 0 && (
                      <span className="text-amber-600 ml-1">
                        ({highlights.filter(h => !h.explanation).length} pending)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {highlights.filter(h => h.explanation).length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No explanations yet.</p>
                      <p className="text-sm mt-2">Click the button to generate explanations!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {highlights.filter(h => h.explanation).map((highlight, index) => (
                        <div
                          key={highlight.id}
                          className="border-2 border-gray-200 rounded-lg overflow-hidden transition-all hover:shadow-lg"
                          style={{ borderLeftWidth: '4px', borderLeftColor: highlight.color }}
                        >
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs bg-indigo-600 font-bold">
                                  {index + 1}
                                </span>
                                <span
                                  className="px-2 py-1 rounded font-medium"
                                  style={{ backgroundColor: highlight.color }}
                                >
                                  {highlight.explanation?.word || highlight.text}
                                </span>
                              </div>
                              <button
                                onClick={() => handleNavigateToHighlight(highlight.id)}
                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                title="Jump to text"
                              >
                                Jump ↗
                              </button>
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            {/* Meaning */}
                            <div className="bg-blue-50 rounded-lg p-3">
                              <div className="text-xs font-semibold text-blue-900 mb-1">
                                💬 Meaning
                              </div>
                              <div className="text-sm text-gray-700">
                                {highlight.explanation?.meaning ? formatText(highlight.explanation.meaning) : 'Loading...'}
                              </div>
                            </div>

                            {/* Grammar */}
                            <div className="bg-purple-50 rounded-lg p-3">
                              <div className="text-xs font-semibold text-purple-900 mb-1">
                                ✨ Grammar
                              </div>
                              <div className="text-sm text-gray-700">
                                {highlight.explanation?.grammar ? formatText(highlight.explanation.grammar) : 'Loading...'}
                              </div>
                            </div>

                            {/* Example */}
                            <div className="bg-green-50 rounded-lg p-3">
                              <div className="text-xs font-semibold text-green-900 mb-1">
                                📖 Example Sentence
                              </div>
                              <div className="text-sm text-gray-700 italic">
                                {highlight.explanation?.example ? formatText(highlight.explanation.example) : 'Loading...'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-400 p-8">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Click "Show Explanations" to view details</p>
                  <p className="text-sm mt-2">Highlight some text first to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

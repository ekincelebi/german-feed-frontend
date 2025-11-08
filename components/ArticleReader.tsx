'use client'

import { useState, useEffect, useRef } from 'react'
import type { LearningArticle } from '@/lib/types'
import GrammarSidebar from './GrammarSidebar'
import CulturalNotes from './CulturalNotes'
import ComprehensionQuestions from './ComprehensionQuestions'
import { Play, Pause, Bookmark, Check, Clock, BookOpen, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type ArticleReaderProps = {
  article: LearningArticle
}

const difficultyColors = {
  'A2': 'bg-green-100 text-green-800',
  'B1': 'bg-blue-100 text-blue-800',
  'B2': 'bg-orange-100 text-orange-800',
  'C1': 'bg-red-100 text-red-800',
  'C2': 'bg-purple-100 text-purple-800',
}

function formatContent(content: string): string {
  // Convert line breaks to <br> tags if not already HTML
  let formattedContent = content
  if (!content.includes('<p>') && !content.includes('<br>')) {
    formattedContent = content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')
    formattedContent = `<p>${formattedContent}</p>`
  }

  return formattedContent
}

export default function ArticleReader({ article }: ArticleReaderProps) {
  const [isRead, setIsRead] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Ensure all learning enhancements are arrays
  // Handle both array format and potential JSON string format
  const parseIfNeeded = (data: any): any[] => {
    if (Array.isArray(data)) return data
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  }

  const vocabularyAnnotations = parseIfNeeded(article.learning_enhancements.vocabulary_annotations)
  const grammarPatterns = parseIfNeeded(article.learning_enhancements.grammar_patterns)
  const culturalNotes = parseIfNeeded(article.learning_enhancements.cultural_notes)
  const comprehensionQuestions = parseIfNeeded(article.learning_enhancements.comprehension_questions)

  // Debug logging
  console.log('Learning enhancements data:', {
    vocabCount: vocabularyAnnotations.length,
    grammarCount: grammarPatterns.length,
    culturalCount: culturalNotes.length,
    questionsCount: comprehensionQuestions.length,
    rawData: article.learning_enhancements
  })

  const formattedContent = formatContent(article.processed_content.cleaned_content)

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

        {/* Main Content */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8 mb-8">
          <div className="article-content-wrapper">
            <article
              dangerouslySetInnerHTML={{ __html: formattedContent }}
              className="prose prose-lg max-w-none
                prose-p:text-gray-900
                prose-p:leading-relaxed
                [&_p]:mb-6
                [&_p:last-child]:mb-0
                whitespace-pre-wrap"
              style={{ whiteSpace: 'pre-wrap' }}
            />
          </div>

          {/* Source Link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
            >
              View Original Article →
            </a>
          </div>
        </div>

        {/* Vocabulary Section */}
        {vocabularyAnnotations.length > 0 && (
          <section className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              <span>📖</span>
              Schlüsselwörter
              <span className="text-sm font-normal text-gray-600">(Key Vocabulary)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vocabularyAnnotations.map((vocab, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {vocab.article && (
                      <span className="text-purple-600 mr-1">{vocab.article}</span>
                    )}
                    {vocab.word}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-800 rounded">
                    {vocab.cefr_level}
                  </span>
                </div>
                {vocab.plural && (
                  <p className="text-xs text-gray-600 mb-2">Plural: {vocab.plural}</p>
                )}
                <div className="space-y-2 text-sm">
                  <p className="text-gray-900 font-medium flex items-start gap-2">
                    <span>🇬🇧</span>
                    {vocab.english_translation}
                  </p>
                  <p className="text-gray-700 flex items-start gap-2">
                    <span>🇩🇪</span>
                    {vocab.german_explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* Grammar Patterns */}
        <GrammarSidebar grammarPatterns={grammarPatterns} />

        {/* Cultural Notes */}
        <CulturalNotes culturalNotes={culturalNotes} />

        {/* Comprehension Questions */}
        <ComprehensionQuestions questions={comprehensionQuestions} />
      </div>
    </div>
  )
}

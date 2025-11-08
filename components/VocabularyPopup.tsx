'use client'

import type { VocabularyItem } from '@/lib/types'

type VocabularyPopupProps = {
  vocab: VocabularyItem
  position: { x: number; y: number }
  onClose: () => void
}

export default function VocabularyPopup({ vocab, position, onClose }: VocabularyPopupProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className="fixed z-50 bg-white border-2 border-purple-600 rounded-lg shadow-2xl p-5 max-w-md"
        style={{
          top: Math.min(position.y + 10, window.innerHeight - 250),
          left: Math.min(position.x + 10, window.innerWidth - 400),
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 text-xl font-bold w-6 h-6 flex items-center justify-center"
          aria-label="Close"
        >
          ×
        </button>

        {/* German Word with Article */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2 mb-1">
            <h4 className="text-2xl font-bold text-gray-900">
              {vocab.article && (
                <span className="text-purple-600 mr-1">
                  {vocab.article}
                </span>
              )}
              {vocab.word}
            </h4>
            <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-800 rounded">
              {vocab.cefr_level}
            </span>
          </div>
          {vocab.plural && (
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Plural:</span> {vocab.plural}
            </p>
          )}
        </div>

        {/* English Translation */}
        <div className="mb-3 pb-3 border-b border-gray-200">
          <div className="flex items-start gap-2">
            <span className="text-lg">🇬🇧</span>
            <p className="text-gray-900 font-medium">{vocab.english_translation}</p>
          </div>
        </div>

        {/* German Explanation */}
        <div className="mb-3 pb-3 border-b border-gray-200">
          <div className="flex items-start gap-2">
            <span className="text-lg">🇩🇪</span>
            <p className="text-gray-700 text-sm">{vocab.german_explanation}</p>
          </div>
        </div>

        {/* Context from Article */}
        <div>
          <div className="flex items-start gap-2">
            <span className="text-lg">📝</span>
            <p className="text-gray-600 text-sm italic">"{vocab.context}"</p>
          </div>
        </div>
      </div>
    </>
  )
}

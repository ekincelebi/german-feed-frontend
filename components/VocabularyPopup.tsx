'use client'

import type { VocabularyWord } from '@/lib/types'

type VocabularyPopupProps = {
  vocab: VocabularyWord
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
        className="fixed z-50 bg-white border-2 border-blue-600 rounded-lg shadow-2xl p-5 max-w-xs"
        style={{
          top: Math.min(position.y + 10, window.innerHeight - 200),
          left: Math.min(position.x + 10, window.innerWidth - 300),
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

        {/* German Word */}
        <div className="mb-3">
          <h4 className="text-xl font-bold text-gray-900">
            {vocab.artikel && (
              <span className="text-blue-600 mr-1">
                {vocab.artikel}
              </span>
            )}
            {vocab.word}
          </h4>
        </div>

        {/* English Translation */}
        <p className="text-gray-900 font-medium mb-2">
          {vocab.english}
        </p>

        {/* Plural Form */}
        {vocab.plural && (
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Plural:</span> {vocab.plural}
          </p>
        )}
      </div>
    </>
  )
}

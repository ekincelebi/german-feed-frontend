import type { GrammarPattern } from '@/lib/types'

type GrammarSidebarProps = {
  grammarPatterns: GrammarPattern[]
}

export default function GrammarSidebar({ grammarPatterns }: GrammarSidebarProps) {
  if (!grammarPatterns || grammarPatterns.length === 0) {
    return null
  }

  return (
    <section className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
        <span>📝</span>
        Grammatikstrukturen
        <span className="text-sm font-normal text-gray-600">(Grammar Patterns)</span>
      </h2>
      <div className="space-y-4">
        {grammarPatterns.map((pattern, index) => (
          <div
            key={index}
            className="border-l-4 border-blue-600 bg-gray-50 rounded-r-lg p-4"
          >
            <h3 className="text-lg font-bold text-blue-700 mb-2">
              {pattern.pattern}
            </h3>
            <div className="bg-white rounded p-3 mb-3 border border-gray-200">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">💡</span>
                <p className="text-gray-900 italic">"{pattern.example}"</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {pattern.explanation}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

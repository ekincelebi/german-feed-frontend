import type { ComprehensionQuestion } from '@/lib/types'

type ComprehensionQuestionsProps = {
  questions: ComprehensionQuestion[]
}

export default function ComprehensionQuestions({ questions }: ComprehensionQuestionsProps) {
  if (!questions || questions.length === 0) {
    return null
  }

  return (
    <section className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
        <span>❓</span>
        Verständnisfragen
        <span className="text-sm font-normal text-gray-600">(Comprehension Questions)</span>
      </h2>
      <ol className="space-y-4">
        {questions.map((q, index) => (
          <li
            key={index}
            className="text-gray-900 leading-relaxed pl-10 relative"
          >
            <span className="absolute left-0 top-0 bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm">
              {index + 1}
            </span>
            {typeof q === 'string' ? q : q.question}
            {typeof q === 'object' && q.type && (
              <span className="ml-2 text-xs text-gray-500 italic">({q.type})</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

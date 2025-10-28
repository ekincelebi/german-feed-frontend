type GrammarSidebarProps = {
  grammarPatterns: string[]
}

export default function GrammarSidebar({ grammarPatterns }: GrammarSidebarProps) {
  if (!grammarPatterns || grammarPatterns.length === 0) {
    return null
  }

  return (
    <aside className="lg:sticky lg:top-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900">
        Grammar Patterns
      </h3>
      <ul className="space-y-3">
        {grammarPatterns.map((pattern, index) => (
          <li
            key={index}
            className="text-sm text-gray-900 font-medium pl-4 border-l-3 border-blue-600"
          >
            {pattern}
          </li>
        ))}
      </ul>
    </aside>
  )
}

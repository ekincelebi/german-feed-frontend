type CulturalNotesProps = {
  culturalNotes: string[]
}

export default function CulturalNotes({ culturalNotes }: CulturalNotesProps) {
  if (!culturalNotes || culturalNotes.length === 0) {
    return null
  }

  return (
    <section className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
        <span>🌍</span>
        Kultureller Kontext
        <span className="text-sm font-normal text-gray-600">(Cultural Context)</span>
      </h2>
      <ul className="space-y-3">
        {culturalNotes.map((note, index) => (
          <li
            key={index}
            className="text-gray-700 leading-relaxed pl-6 relative"
          >
            <span className="absolute left-0 text-green-600 font-bold text-xl">
              •
            </span>
            {note}
          </li>
        ))}
      </ul>
    </section>
  )
}

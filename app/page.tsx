import { supabase } from '@/lib/supabase'
import LevelSelector from '@/components/LevelSelector'
import type { ArticleStatistics } from '@/lib/types'

export default async function HomePage() {
  // Fetch statistics for each level
  const { data: stats } = await supabase
    .from('article_statistics')
    .select('*')
    .single()

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-6xl space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            German Reading Practice
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Read authentic German news articles at your level
          </p>
        </div>

        {/* Level Selector */}
        <LevelSelector stats={stats as ArticleStatistics | null} />
      </div>
    </div>
  )
}

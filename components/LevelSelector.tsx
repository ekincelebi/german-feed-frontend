import Link from 'next/link'
import { CEFR_LEVELS, type CEFRLevel, type ArticleStatistics } from '@/lib/types'
import { FileText, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type LevelSelectorProps = {
  stats?: ArticleStatistics | null
}

const LEVEL_TITLES: Record<CEFRLevel, string> = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper Intermediate',
  C1: 'Advanced',
  C2: 'Mastery',
}

const LEVEL_COLORS: Record<CEFRLevel, { bg: string; border: string; text: string; accent: string }> = {
  A1: { bg: 'bg-emerald-50 hover:bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-900', accent: 'bg-emerald-500' },
  A2: { bg: 'bg-green-50 hover:bg-green-100', border: 'border-green-200', text: 'text-green-900', accent: 'bg-green-500' },
  B1: { bg: 'bg-blue-50 hover:bg-blue-100', border: 'border-blue-200', text: 'text-blue-900', accent: 'bg-blue-500' },
  B2: { bg: 'bg-indigo-50 hover:bg-indigo-100', border: 'border-indigo-200', text: 'text-indigo-900', accent: 'bg-indigo-500' },
  C1: { bg: 'bg-purple-50 hover:bg-purple-100', border: 'border-purple-200', text: 'text-purple-900', accent: 'bg-purple-500' },
  C2: { bg: 'bg-violet-50 hover:bg-violet-100', border: 'border-violet-200', text: 'text-violet-900', accent: 'bg-violet-500' },
}

export default function LevelSelector({ stats }: LevelSelectorProps) {
  const getLevelCount = (level: CEFRLevel): number => {
    if (!stats) return 0
    const key = `level_${level.toLowerCase()}_count` as keyof ArticleStatistics
    return stats[key] as number
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {CEFR_LEVELS.map((level) => {
        const colors = LEVEL_COLORS[level]
        const title = LEVEL_TITLES[level]
        const count = getLevelCount(level)

        return (
          <Link
            key={level}
            href={`/articles/${level}`}
            className={cn(
              'group relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-300',
              'hover:shadow-xl hover:-translate-y-1',
              colors.bg,
              colors.border
            )}
          >
            {/* Accent bar */}
            <div className={cn('absolute top-0 left-0 right-0 h-1', colors.accent)} />

            {/* Content */}
            <div className="space-y-4">
              {/* Level badge and title */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    'text-5xl font-black tracking-tight',
                    colors.text
                  )}>
                    {level}
                  </div>
                  {count > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 bg-white/60 px-2 py-1 rounded-full">
                      <FileText className="h-3 w-3" />
                      <span>{count}</span>
                    </div>
                  )}
                </div>
                <h3 className={cn('font-bold text-xl', colors.text)}>
                  {title}
                </h3>
              </div>

              {/* Arrow indicator */}
              <div className="flex items-center gap-2 text-xs text-gray-500 group-hover:gap-3 transition-all">
                <span>View articles</span>
                <TrendingUp className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

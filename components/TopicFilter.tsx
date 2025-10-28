'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type TopicWithCount = {
  topic: string
  count: number
}

type TopicFilterProps = {
  level: string
}

export default function TopicFilter({ level }: TopicFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTopic = searchParams.get('topic')
  const [topics, setTopics] = useState<TopicWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopics = async () => {
      // Fetch articles for this level and extract topics
      const { data, error } = await supabase
        .from('article_list_view')
        .select('topics')
        .eq('language_level', level.toUpperCase())

      if (!error && data) {
        // Count topic occurrences
        const topicCounts: Record<string, number> = {}

        data.forEach((article) => {
          if (article.topics && Array.isArray(article.topics)) {
            article.topics.forEach((topic: string) => {
              topicCounts[topic] = (topicCounts[topic] || 0) + 1
            })
          }
        })

        // Convert to array and sort by count (descending), limit to top 20
        const topicArray = Object.entries(topicCounts)
          .map(([topic, count]) => ({ topic, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20)

        setTopics(topicArray)
      }
      setLoading(false)
    }

    fetchTopics()
  }, [level])

  const handleTopicChange = (topic: string) => {
    if (topic === '') {
      router.push(`/articles/${level}`)
    } else {
      router.push(`/articles/${level}?topic=${encodeURIComponent(topic)}`)
    }
  }

  if (loading) {
    return (
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Loading topics...
        </label>
      </div>
    )
  }

  if (topics.length === 0) {
    return null
  }

  const totalCount = topics.reduce((sum, t) => sum + t.count, 0)

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleTopicChange('')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            !currentTopic
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300'
          }`}
        >
          All Topics ({totalCount})
        </button>
        {topics.map((topic) => (
          <button
            key={topic.topic}
            onClick={() => handleTopicChange(topic.topic)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              currentTopic === topic.topic
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300'
            }`}
          >
            {topic.topic} ({topic.count})
          </button>
        ))}
      </div>
    </div>
  )
}

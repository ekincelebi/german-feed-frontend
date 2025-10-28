// CEFR Levels
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
export type CEFRLevel = typeof CEFR_LEVELS[number]

// Vocabulary word structure
export type VocabularyWord = {
  word: string
  artikel: string | null  // "der", "die", "das", or null for verbs
  english: string
  plural: string | null
}

// Article list item (from article_list_view)
export type ArticleListItem = {
  id: string
  title: string
  url: string
  published_date: string
  source_domain: string
  language_level: CEFRLevel
  topics: string[]
  word_count_after: number
  created_at: string
}

// Article detail (from article_detail_view)
export type ArticleDetail = {
  id: string
  url: string
  title: string
  published_date: string
  author: string | null
  source_domain: string
  language_level: CEFRLevel
  topics: string[]
  vocabulary: VocabularyWord[]
  grammar_patterns: string[]
  cleaned_content: string
  word_count_after: number
  created_at: string
}

// Statistics (from article_statistics view)
export type ArticleStatistics = {
  total_articles: number
  level_a1_count: number
  level_a2_count: number
  level_b1_count: number
  level_b2_count: number
  level_c1_count: number
  level_c2_count: number
  avg_word_count: number
}

// Topic with count (from get_unique_topics function)
export type TopicWithCount = {
  topic: string
  count: number
}

// Domain with count (from get_unique_domains function)
export type DomainWithCount = {
  domain: string
  count: number
}

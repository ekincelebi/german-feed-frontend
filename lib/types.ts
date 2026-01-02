// Core Article Type
export interface Article {
  id: string
  title: string
  url: string
  source_name: string
  published_at: string
  theme: string | null
  created_at: string
}

// Processed Content Type
export interface ProcessedContent {
  id: string
  article_id: string
  cleaned_content: string
  summary: string
  reading_level: string
  processing_tokens: number
  processing_cost_usd: number
  model_used: string
  created_at: string
}

// Vocabulary Item Type
export interface VocabularyItem {
  word: string
  article: string | null        // "der" | "die" | "das" for nouns
  plural: string | null          // Plural form for nouns
  context: string                // Sentence from article
  english_translation: string
  german_explanation: string     // Simple German definition
  cefr_level: string            // "A2" | "B1" | "B2" | "C1"
}

// Grammar Pattern Type
export interface GrammarPattern {
  pattern: string                // e.g., "Perfekt tense"
  example: string                // Sentence from article
  explanation: string            // German explanation
}

// Comprehension Question Type
export interface ComprehensionQuestion {
  question: string               // Question in German
  type?: string                  // Optional: "main_idea" | "detail" | "inference"
}

// Learning Enhancements Type
export interface LearningEnhancements {
  id: string
  article_id: string
  vocabulary_annotations: VocabularyItem[]
  grammar_patterns: GrammarPattern[]
  cultural_notes: string[]
  comprehension_questions: ComprehensionQuestion[]
  estimated_difficulty: 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  estimated_reading_time: number  // minutes
  processing_tokens: number
  processing_cost_usd: number
  model_used: string
  created_at: string
  updated_at: string
}

// Complete Article for Display
export interface LearningArticle {
  id: string
  title: string
  url: string
  source_name: string
  published_at: string
  theme: string | null
  created_at: string
  processed_content: ProcessedContent
  learning_enhancements: LearningEnhancements
}

// Saved Words Types
export interface SavedWord {
  id: string
  word: string
  meaning: string
  grammar: string
  example: string
  articleId: string
  color: string
  savedAt: number
  groupId: string | null
  onlyShowInGroup: boolean
  order: number
}

export interface WordGroup {
  id: string
  name: string
  createdAt: number
  order: number
}

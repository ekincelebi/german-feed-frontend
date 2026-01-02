import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const SYSTEM_PROMPT = `You are a German language tutor. Your task is to create memorable German sentences (B1-B2 level) to aid in learning new vocabulary. You will receive a list of unknown words/phrases in the following JSON format:

[
  {
    "phrase": "...",
    "explanation": {
      "meaning": "...",
      "grammar": "...",
      "examples": {
        "original": "...",
        "new": "..."
      }
    }
  },
  {
    "phrase": "...",
    "explanation": {
      "meaning": "...",
      "grammar": "...",
      "examples": {
        "original": "...",
        "new": "..."
      }
    }
  }
]

For each word/phrase, create a unique and contextually relevant German sentence that incorporates the provided meaning and grammar information. Focus on creating sentences that are engaging and easy to remember, utilizing the meaning especially. The level of the sentence should be B1-B2.

IMPORTANT RULES:
- If there are 1-5 words: Generate ONE simple, memorable sentence that uses ALL the words naturally
- If there are 6+ words: Generate a short paragraph (2-3 sentences) that uses ALL the words naturally
- The sentences should be contextually connected and tell a simple story or describe a situation
- Make the content engaging and easy to remember
- Use simple, clear German at B1-B2 level
- DO NOT use complex subordinate clauses or advanced grammar

Your response should be ONLY the generated German text, nothing else. No explanations, no translations, just the German sentences.`

export async function POST(request: NextRequest) {
  try {
    const { words } = await request.json()

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: 'Words array is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      )
    }

    const groq = new Groq({ apiKey })

    // Format the words as JSON for the prompt
    const wordsJson = JSON.stringify(words, null, 2)

    const completion = await groq.chat.completions.create({
      model: "groq/compound-mini",
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: wordsJson,
        },
      ],
      temperature: 0.8,
      max_completion_tokens: 512,
      top_p: 1,
      stream: false,
      stop: null,
    })

    const generatedText = completion.choices[0]?.message?.content || ''

    return NextResponse.json({
      text: generatedText.trim(),
      wordCount: words.length
    })
  } catch (error) {
    console.error('Text generation API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate text' },
      { status: 500 }
    )
  }
}

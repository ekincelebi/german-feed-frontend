import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const SYSTEM_PROMPT = `You are a German language tutor. Your task is to provide simple and clear explanations of specific words and phrases extracted from a given German text. For each word/phrase, provide the following:
Meaning: A concise definition in English.
Grammar: A brief explanation of the grammatical structure, including relevant parts of speech (e.g., preposition with dative, reflexive verb).
Example: Two example sentences demonstrating the usage of the word/phrase in context. One example should be from the original text, and the other should be a new, original sentence.
The input will be a German text snippet followed by a list of words/phrases extracted from the text. The output should be a numbered list, with each item corresponding to a word/phrase and containing the "Meaning," "Grammar," and "Example" sections as described above. Ensure clarity and accessibility for language learners. 

Output will be in a JSON format like this: 

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

Example Input:


Text: Moderatorin und Sängerin Ina Müller, 60, leidet eigenem Bekunden nach unter Altersdiskriminierung. »Dass da so getan wird, als wäre ich rücksichtslos und schuld an allem, das beleidigt mich zutiefst«, sagte Müller. Worauf sie sich konkret bezog, blieb dabei unklar. Sie fuhr fort: »Ich habe mich während meines Lebens nie als Frau diskriminiert gefühlt, aber jetzt fühle ich mich wegen meines Alters diskriminiert.«
Words/Phrases:
- nach eigenem Bekunden
- leidet unter
- schuld an etwas sein


Example Output:


[
  {
    "phrase": "nach eigenem Bekunden",
    "explanation": {
      "meaning": "According to one's own statement; by one's own account.",
      "grammar": "\"nach\" (preposition with dative), \"eigenem\" (dative form of \"eigen\" - own), \"Bekunden\" (noun, declaration).",
      "examples": {
        "original": "Moderatorin und Sängerin Ina Müller, 60, leidet eigenem Bekunden nach unter Altersdiskriminierung.",
        "new": "Nach eigenem Bekunden ist er unschuldig."
      }
    }
  },
  {
    "phrase": "leidet unter",
    "explanation": {
      "meaning": "Suffers from (used for non-physical or emotional suffering).",
      "grammar": "\"leiden\" (verb - to suffer), \"unter\" (preposition + Dative).",
      "examples": {
        "original": "Ina Müller, 60, leidet eigenem Bekunden nach unter Altersdiskriminierung.",
        "new": "Sie leidet unter großem Stress."
      }
    }
  },
... and so on for the remaining phrases.
]`

export async function POST(request: NextRequest) {
  try {
    const { text, phrases } = await request.json()

    if (!text || !phrases || !Array.isArray(phrases) || phrases.length === 0) {
      return NextResponse.json(
        { error: 'Text and phrases array are required' },
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

    // Build the user prompt
    const userPrompt = `Text: ${text}

Words/Phrases:
${phrases.map(p => `- ${p}`).join('\n')}`

    const completion = await groq.chat.completions.create({
      model: "groq/compound-mini",
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null,
    })


    const responseText = completion.choices[0]?.message?.content || ''

    // Parse the response into structured data
    const explanations = parseExplanations(responseText, phrases)

    return NextResponse.json(explanations)
  } catch (error) {
    console.error('Explanation API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate explanations' },
      { status: 500 }
    )
  }
}

function parseExplanations(responseText: string, phrases: string[]) {
  try {
    // Try to extract JSON from the response (it might have markdown code blocks)
    let jsonText = responseText.trim()

    // Remove markdown code blocks if present
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    }

    // Parse the JSON
    const parsedData = JSON.parse(jsonText)

    // Transform to our expected format
    const explanations = parsedData.map((item: any) => ({
      phrase: item.phrase,
      explanation: {
        word: item.phrase,
        meaning: item.explanation.meaning,
        grammar: item.explanation.grammar,
        example: item.explanation.examples?.new || item.explanation.examples?.original || 'No example provided',
      },
    }))

    return explanations
  } catch (error) {
    console.error('Failed to parse JSON response:', error)
    console.error('Response text:', responseText)

    // Fallback: create default explanations
    return phrases.map(phrase => ({
      phrase,
      explanation: {
        word: phrase,
        meaning: 'Explanation not available',
        grammar: 'Not specified',
        example: 'No example available',
      },
    }))
  }
}

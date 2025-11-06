import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ELEVEN_LABS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Eleven Labs API key not configured' },
        { status: 500 }
      )
    }

    // Use Eleven Labs German voice (Emilia)
    const voiceId = 'ghgFyr7gmpr57xyTgX9q' // Emilia

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Eleven Labs API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to generate audio' },
        { status: response.status }
      )
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('Text-to-speech error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

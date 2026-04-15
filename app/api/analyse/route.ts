import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json()

    const prompt = `Analyse this image and return a JSON object with the following fields. Return ONLY valid JSON, no markdown, no explanation.

{
  "subjectPosition": "left" | "center" | "right" | "full",
  "safeZone": "top" | "bottom" | "left" | "right",
  "brightness": "light" | "dark" | "mixed",
  "textColor": "#ffffff" | "#000000",
  "dominantBgColor": hex color of the cleanest background area suitable for overlay
}

Rules:
- subjectPosition: where is the main subject (person/product/object)?
- safeZone: which area of the image has the cleanest background for text?
- brightness: is the safe zone area light, dark, or mixed?
- textColor: what text color would be most readable over the safe zone?
- dominantBgColor: pick the color of the background in the safe zone area`

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
          { type: 'text', text: prompt }
        ]
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const analysis = JSON.parse(clean)
    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Claude analysis error:', error)
    // Return sensible default if API fails
    return NextResponse.json({
      analysis: {
        subjectPosition: 'center',
        safeZone: 'bottom',
        brightness: 'dark',
        textColor: '#ffffff',
        dominantBgColor: '#000000'
      }
    })
  }
}

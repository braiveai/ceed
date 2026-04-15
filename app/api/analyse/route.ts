import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json()

    const prompt = `Analyse this image and return a JSON object. Return ONLY valid JSON, no markdown, no explanation.

{
  "subjectPosition": "left" | "center" | "right" | "full",
  "safeZone": "top" | "bottom" | "left" | "right",
  "brightness": "light" | "dark" | "mixed",
  "textColor": "#ffffff" | "#000000",
  "dominantBgColor": "hex color of the cleanest background area",
  "suggestedCtaColor": "hex color — pick a bold accent colour from the image that would work as a CTA button. Should be vibrant and contrast well against white text. If the image is mostly neutral/grey, suggest a strong brand-appropriate colour."
}`

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
        subjectPosition: 'center', safeZone: 'bottom', brightness: 'dark',
        textColor: '#ffffff', dominantBgColor: '#000000', suggestedCtaColor: '#2563EB'
      }
    })
  }
}

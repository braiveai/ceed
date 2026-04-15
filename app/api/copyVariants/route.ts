import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { companyName, industry, offer } = await req.json()

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Generate 3 distinct ad copy variants for this business. Return ONLY valid JSON, no markdown.

Business: ${companyName || 'a business'}
Industry/context: ${industry || 'general'}
Offer/message: ${offer || 'their service'}

Return this exact structure:
{
  "variants": [
    { "headline": "max 8 words", "subHeadline": "max 12 words", "ctaText": "2-4 words" },
    { "headline": "max 8 words", "subHeadline": "max 12 words", "ctaText": "2-4 words" },
    { "headline": "max 8 words", "subHeadline": "max 12 words", "ctaText": "2-4 words" }
  ]
}

Make them distinct — different angles, tones, and hooks. Direct, punchy, no fluff.`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const { variants } = JSON.parse(text.replace(/```json|```/g, '').trim())
    return NextResponse.json({ variants })
  } catch (error) {
    console.error('Copy variants error:', error)
    return NextResponse.json({ error: 'Failed to generate variants' }, { status: 500 })
  }
}

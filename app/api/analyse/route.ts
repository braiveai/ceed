import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType, width, height, copySet, brandKit } = await req.json()

    const prompt = `You are an expert ad designer. Analyse this image and return optimal placement coordinates for ad creative elements.

Canvas size: ${width}px wide × ${height}px tall.

Copy to place:
- Headline: "${copySet.headline}"
- Sub-headline: "${copySet.subHeadline}"  
- CTA Button: "${copySet.ctaText}"
- Brand: "${brandKit.companyName}"

Brand colours: primary=${brandKit.primaryColor}, secondary=${brandKit.secondaryColor}

Rules:
1. Identify the main subject in the image (person, product, object) and avoid placing text over their face or the key focal point
2. Find safe zones with clean background suitable for text overlay
3. Logo should be prominent but not dominate
4. CTA button should be visually striking in the primary brand colour
5. Ensure text is readable — suggest dark overlay if image is busy

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "safeZone": "top" | "bottom" | "left" | "right" | "overlay",
  "subjectPosition": "left" | "center" | "right" | "full",
  "elements": [
    {
      "type": "logo",
      "x": number (pixels from left),
      "y": number (pixels from top),
      "width": number,
      "height": number,
      "zIndex": 10
    },
    {
      "type": "headline",
      "x": number,
      "y": number,
      "width": number,
      "height": number,
      "fontSize": number,
      "textAlign": "left" | "center" | "right",
      "color": "#ffffff" or dark hex,
      "zIndex": 10
    },
    {
      "type": "subheadline",
      "x": number,
      "y": number,
      "width": number,
      "height": number,
      "fontSize": number,
      "textAlign": "left" | "center" | "right",
      "color": "#ffffff" or dark hex,
      "zIndex": 10
    },
    {
      "type": "cta",
      "x": number,
      "y": number,
      "width": number,
      "height": number,
      "fontSize": number,
      "backgroundColor": "${brandKit.primaryColor}",
      "color": "#ffffff",
      "borderRadius": 8,
      "zIndex": 10
    },
    {
      "type": "overlay",
      "x": 0,
      "y": number (start of safe zone),
      "width": ${width},
      "height": number,
      "backgroundColor": "#000000",
      "opacity": 0.45,
      "zIndex": 5
    }
  ]
}

Make the layout look professional and balanced. Scale font sizes appropriately for the canvas size (${width}×${height}). For small banners under 200px tall, omit subheadline and overlay. For very wide formats like leaderboards, arrange elements horizontally.`

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const layout = JSON.parse(clean)

    return NextResponse.json({ layout })
  } catch (error) {
    console.error('Claude analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}

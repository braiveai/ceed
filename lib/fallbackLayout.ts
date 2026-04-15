import { ElementPlacement, ImageAnalysis, StyleDefaults } from '@/types'
import { AdSpec } from './specs'
import { estimateTextHeight, fitFontSize } from './textUtils'

interface CopySet { headline: string; subHeadline: string; ctaText: string }
interface BrandKit { primaryColor: string; secondaryColor: string; companyName: string }

const DEFAULT_ANALYSIS: ImageAnalysis = {
  subjectPosition: 'center', safeZone: 'bottom', brightness: 'dark',
  textColor: '#ffffff', dominantBgColor: '#000000'
}
const DEFAULT_STYLE: StyleDefaults = {
  fontSizeScale: 1, overlayOpacity: 0.5, overlayPosition: 'auto',
  textColor: '#ffffff', overlayColor: '#000000'
}

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)) }

function buildStackedLayout(
  width: number, height: number,
  copySet: CopySet, brandKit: BrandKit, style: StyleDefaults,
  overlayPos: 'top' | 'bottom'
): ElementPlacement[] {
  const s = style.fontSizeScale
  const pad = Math.round(clamp(width * 0.055, 10, 48))
  const innerW = width - pad * 2
  const textColor = style.textColor
  const overlayColor = style.overlayColor

  const logoH = clamp(Math.round(height * 0.07), 18, 52)
  const logoW = logoH * 3.5
  const gap = Math.round(pad * 0.45)
  const ctaH = clamp(Math.round(height * 0.075), 26, 56)
  const ctaW = clamp(Math.round(innerW * 0.48), 70, 220)

  // Initial font sizes
  let hSize = clamp(Math.round(Math.min(width * 0.068, height * 0.088) * s), 12, 80)
  let subSize = clamp(Math.round(hSize * 0.58 * s), 9, 36)
  const ctaFontSize = clamp(Math.round(hSize * 0.42), 9, 22)

  // Available height for text (overlay should contain: logo + headline + sub + cta + padding)
  const minOverlayH = logoH + gap + ctaH + gap * 2 + pad * 2
  const maxOverlayH = Math.round(height * 0.68)

  // Fit font sizes to reasonable budget
  const textBudget = maxOverlayH - minOverlayH
  hSize = fitFontSize(copySet.headline, innerW, Math.round(textBudget * 0.58), hSize)
  subSize = fitFontSize(copySet.subHeadline, innerW, Math.round(textBudget * 0.32), Math.round(hSize * 0.58))

  const hH = estimateTextHeight(copySet.headline, hSize, innerW)
  const subH = estimateTextHeight(copySet.subHeadline, subSize, innerW)
  const totalContent = pad + logoH + gap + hH + gap + subH + gap + ctaH + pad
  const overlayH = clamp(Math.round(totalContent), minOverlayH, maxOverlayH)
  const overlayY = overlayPos === 'top' ? 0 : height - overlayH

  let cursor = overlayY + pad

  const elements: ElementPlacement[] = [
    { type: 'overlay', x: 0, y: overlayY, width, height: overlayH, backgroundColor: overlayColor, opacity: style.overlayOpacity, zIndex: 5 },
    { type: 'logo', x: pad, y: cursor, width: logoW, height: logoH, zIndex: 10 },
  ]
  cursor += logoH + gap

  elements.push({ type: 'headline', x: pad, y: cursor, width: innerW, height: hH + 4, fontSize: hSize, textAlign: 'left', color: textColor, zIndex: 10 })
  cursor += hH + gap

  elements.push({ type: 'subheadline', x: pad, y: cursor, width: innerW, height: subH + 4, fontSize: subSize, textAlign: 'left', color: textColor, zIndex: 10 })
  cursor += subH + gap

  elements.push({ type: 'cta', x: pad, y: cursor, width: ctaW, height: ctaH, fontSize: ctaFontSize, textAlign: 'center', backgroundColor: brandKit.primaryColor, color: '#ffffff', borderRadius: 8, zIndex: 10 })

  return elements
}

export function generateLayout(
  spec: AdSpec, copySet: CopySet, brandKit: BrandKit,
  analysis: ImageAnalysis = DEFAULT_ANALYSIS, style: StyleDefaults = DEFAULT_STYLE
): ElementPlacement[] {
  const { width, height } = spec
  const s = style.fontSizeScale
  const overlayPos = style.overlayPosition === 'auto'
    ? (analysis.safeZone === 'top' ? 'top' : 'bottom')
    : style.overlayPosition

  const isWide = width / height > 2.2
  const isTiny = height < 80

  if (isTiny) {
    const fs = clamp(Math.round(height * 0.32 * s), 9, 16)
    if (width / height > 3) {
      // horizontal tiny — logo left, headline mid, cta right
      const pad = Math.round(height * 0.1)
      const logoH = Math.round(height * 0.5)
      return [
        { type: 'overlay', x: 0, y: 0, width, height, backgroundColor: style.overlayColor, opacity: style.overlayOpacity * 0.7, zIndex: 5 },
        { type: 'logo', x: pad, y: Math.round((height - logoH) / 2), width: logoH * 3, height: logoH, zIndex: 10 },
        { type: 'headline', x: Math.round(width * 0.22), y: Math.round(height * 0.15), width: Math.round(width * 0.46), height: Math.round(height * 0.7), fontSize: fs, textAlign: 'left', color: style.textColor, zIndex: 10 },
        { type: 'cta', x: Math.round(width * 0.72), y: Math.round(height * 0.15), width: Math.round(width * 0.24), height: Math.round(height * 0.7), fontSize: Math.max(9, fs - 2), textAlign: 'center', backgroundColor: brandKit.primaryColor, color: '#ffffff', borderRadius: 3, zIndex: 10 },
      ]
    }
    return [{ type: 'cta', x: Math.round(width * 0.04), y: Math.round(height * 0.1), width: Math.round(width * 0.92), height: Math.round(height * 0.8), fontSize: fs, textAlign: 'center', backgroundColor: brandKit.primaryColor, color: '#ffffff', borderRadius: 4, zIndex: 10 }]
  }

  if (isWide) {
    const pad = Math.round(clamp(height * 0.1, 8, 24))
    const logoH = clamp(Math.round(height * 0.42), 16, 44)
    const logoW = logoH * 3.5
    const textX = Math.round(logoW + pad * 2.5)
    const textW = Math.round(width * 0.5)
    const ctaW = clamp(Math.round(width * 0.2), 60, 160)
    const ctaH = clamp(Math.round(height * 0.55), 24, 50)
    let hSize = fitFontSize(copySet.headline, textW, Math.round(height * 0.45), clamp(Math.round(height * 0.3 * s), 10, 28))
    let subSize = fitFontSize(copySet.subHeadline, textW, Math.round(height * 0.28), clamp(Math.round(hSize * 0.62), 9, 18))

    return [
      { type: 'overlay', x: 0, y: 0, width, height, backgroundColor: style.overlayColor, opacity: style.overlayOpacity * 0.65, zIndex: 5 },
      { type: 'logo', x: pad, y: Math.round((height - logoH) / 2), width: logoW, height: logoH, zIndex: 10 },
      { type: 'headline', x: textX, y: Math.round(height * 0.1), width: textW, height: Math.round(height * 0.45), fontSize: hSize, textAlign: 'left', color: style.textColor, zIndex: 10 },
      { type: 'subheadline', x: textX, y: Math.round(height * 0.56), width: textW, height: Math.round(height * 0.3), fontSize: subSize, textAlign: 'left', color: style.textColor, zIndex: 10 },
      { type: 'cta', x: width - ctaW - pad, y: Math.round((height - ctaH) / 2), width: ctaW, height: ctaH, fontSize: clamp(Math.round(hSize * 0.45), 9, 16), textAlign: 'center', backgroundColor: brandKit.primaryColor, color: '#ffffff', borderRadius: 5, zIndex: 10 },
    ]
  }

  return buildStackedLayout(width, height, copySet, brandKit, style, overlayPos)
}

export const generateFallbackLayout = generateLayout

// Logo-only layout for PMax logo assets
export function generateLogoLayout(spec: AdSpec, brandKit: BrandKit, style: StyleDefaults): ElementPlacement[] {
  const { width, height } = spec
  const pad = Math.round(Math.min(width, height) * 0.1)
  return [
    { type: 'overlay', x: 0, y: 0, width, height, backgroundColor: style.overlayColor, opacity: 0.15, zIndex: 2 },
    { type: 'logo', x: pad, y: Math.round((height - height * 0.4) / 2), width: width - pad * 2, height: Math.round(height * 0.4), zIndex: 10 },
  ]
}

export const LOGO_ONLY_SPECS = ['pmax-logo-square', 'pmax-logo-landscape']

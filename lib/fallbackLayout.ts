import { ElementPlacement, ImageAnalysis, StyleDefaults } from '@/types'
import { AdSpec } from './specs'

interface CopySet { headline: string; subHeadline: string; ctaText: string }
interface BrandKit { primaryColor: string; secondaryColor: string; companyName: string }

const DEFAULT_ANALYSIS: ImageAnalysis = {
  subjectPosition: 'center', safeZone: 'bottom',
  brightness: 'dark', textColor: '#ffffff', dominantBgColor: '#000000'
}

const DEFAULT_STYLE: StyleDefaults = {
  fontSizeScale: 1, overlayOpacity: 0.5,
  overlayPosition: 'auto', textColor: '#ffffff', overlayColor: '#000000'
}

export function generateLayout(
  spec: AdSpec,
  copySet: CopySet,
  brandKit: BrandKit,
  analysis: ImageAnalysis = DEFAULT_ANALYSIS,
  style: StyleDefaults = DEFAULT_STYLE
): ElementPlacement[] {
  const { width, height } = spec
  const s = style.fontSizeScale
  const overlayColor = style.overlayColor
  const overlayOpacity = style.overlayOpacity
  const textColor = style.textColor || analysis.textColor || '#ffffff'

  // Determine overlay position from analysis + style preference
  const overlayPos = style.overlayPosition === 'auto'
    ? (analysis.safeZone === 'top' ? 'top' : 'bottom')
    : style.overlayPosition

  const isWide = width > height * 2.5
  const isTall = height > width * 1.5
  const isSquare = !isWide && !isTall
  const isTiny = height < 80
  const isSmallBanner = height < 150 && width > 300

  // --- TINY (e.g. 125×125 button, 120×60) ---
  if (isTiny) {
    return [{
      type: 'cta', x: Math.round(width * 0.05), y: Math.round(height * 0.1),
      width: Math.round(width * 0.9), height: Math.round(height * 0.8),
      fontSize: Math.max(9, Math.round(height * 0.32 * s)),
      textAlign: 'center', backgroundColor: brandKit.primaryColor,
      color: '#ffffff', borderRadius: 4, zIndex: 10,
    }]
  }

  // --- WIDE BANNERS (leaderboard, panorama etc) ---
  if (isWide || isSmallBanner) {
    const logoH = Math.round(height * 0.45)
    const logoW = Math.round(logoH * 3)
    const pad = Math.round(Math.min(width, height) * 0.06)
    const headingSize = Math.max(10, Math.round(height * 0.3 * s))
    const subSize = Math.max(8, Math.round(height * 0.2 * s))
    const ctaW = Math.round(Math.min(width * 0.22, 160))
    const ctaH = Math.round(height * 0.55)

    const elements: ElementPlacement[] = [
      { type: 'overlay', x: 0, y: 0, width, height, backgroundColor: overlayColor, opacity: overlayOpacity * 0.6, zIndex: 2 },
      { type: 'logo', x: pad, y: Math.round((height - logoH) / 2), width: logoW, height: logoH, zIndex: 10 },
      {
        type: 'headline', x: logoW + pad * 2, y: Math.round(height * 0.12),
        width: Math.round(width * 0.48), height: Math.round(height * 0.45),
        fontSize: headingSize, textAlign: 'left', color: textColor, zIndex: 10,
      },
    ]

    if (height > 60) {
      elements.push({
        type: 'subheadline', x: logoW + pad * 2, y: Math.round(height * 0.55),
        width: Math.round(width * 0.44), height: Math.round(height * 0.3),
        fontSize: subSize, textAlign: 'left', color: textColor, zIndex: 10,
      })
    }

    elements.push({
      type: 'cta', x: width - ctaW - pad, y: Math.round((height - ctaH) / 2),
      width: ctaW, height: ctaH,
      fontSize: Math.max(9, Math.round(height * 0.24 * s)),
      textAlign: 'center', backgroundColor: brandKit.primaryColor,
      color: '#ffffff', borderRadius: 6, zIndex: 10,
    })

    return elements
  }

  // --- TALL / PORTRAIT / STORIES (9:16, 4:5, etc) ---
  if (isTall) {
    const pad = Math.round(width * 0.06)
    const overlayH = Math.round(height * 0.38)
    const overlayY = overlayPos === 'top' ? 0 : height - overlayH
    const logoSize = Math.round(width * 0.09)

    return [
      { type: 'overlay', x: 0, y: overlayY, width, height: overlayH, backgroundColor: overlayColor, opacity: overlayOpacity, zIndex: 5 },
      { type: 'logo', x: pad, y: overlayPos === 'top' ? overlayY + pad : pad, width: logoSize * 3, height: logoSize, zIndex: 10 },
      {
        type: 'headline', x: pad, y: overlayY + Math.round(overlayH * 0.08),
        width: width - pad * 2, height: Math.round(overlayH * 0.32),
        fontSize: Math.round(width * 0.065 * s), textAlign: 'left', color: textColor, zIndex: 10,
      },
      {
        type: 'subheadline', x: pad, y: overlayY + Math.round(overlayH * 0.42),
        width: width - pad * 2, height: Math.round(overlayH * 0.22),
        fontSize: Math.round(width * 0.036 * s), textAlign: 'left', color: textColor, zIndex: 10,
      },
      {
        type: 'cta', x: pad, y: overlayY + Math.round(overlayH * 0.67),
        width: Math.round(width * 0.48), height: Math.round(overlayH * 0.26),
        fontSize: Math.round(width * 0.032 * s), textAlign: 'center',
        backgroundColor: brandKit.primaryColor, color: '#ffffff', borderRadius: 8, zIndex: 10,
      },
    ]
  }

  // --- SQUARE ---
  if (isSquare) {
    const pad = Math.round(width * 0.05)
    const overlayH = Math.round(height * 0.42)
    const overlayY = overlayPos === 'top' ? 0 : height - overlayH
    const logoSize = Math.round(width * 0.08)
    const logoY = overlayPos === 'bottom' ? pad : overlayY + overlayH + pad

    return [
      { type: 'overlay', x: 0, y: overlayY, width, height: overlayH, backgroundColor: overlayColor, opacity: overlayOpacity, zIndex: 5 },
      { type: 'logo', x: pad, y: logoY, width: logoSize * 3.5, height: logoSize, zIndex: 10 },
      {
        type: 'headline', x: pad, y: overlayY + Math.round(overlayH * 0.06),
        width: width - pad * 2, height: Math.round(overlayH * 0.34),
        fontSize: Math.round(width * 0.058 * s), textAlign: 'left', color: textColor, zIndex: 10,
      },
      {
        type: 'subheadline', x: pad, y: overlayY + Math.round(overlayH * 0.42),
        width: width - pad * 2, height: Math.round(overlayH * 0.22),
        fontSize: Math.round(width * 0.033 * s), textAlign: 'left', color: textColor, zIndex: 10,
      },
      {
        type: 'cta', x: pad, y: overlayY + Math.round(overlayH * 0.67),
        width: Math.round(width * 0.44), height: Math.round(overlayH * 0.26),
        fontSize: Math.round(width * 0.03 * s), textAlign: 'center',
        backgroundColor: brandKit.primaryColor, color: '#ffffff', borderRadius: 8, zIndex: 10,
      },
    ]
  }

  // --- DEFAULT LANDSCAPE ---
  const pad = Math.round(width * 0.04)
  const overlayH = Math.round(height * 0.48)
  const overlayY = overlayPos === 'top' ? 0 : height - overlayH
  const logoSize = Math.round(height * 0.1)
  const logoY = overlayPos === 'bottom' ? pad : overlayY + overlayH + pad

  return [
    { type: 'overlay', x: 0, y: overlayY, width, height: overlayH, backgroundColor: overlayColor, opacity: overlayOpacity, zIndex: 5 },
    { type: 'logo', x: pad, y: logoY, width: logoSize * 3, height: logoSize, zIndex: 10 },
    {
      type: 'headline', x: pad, y: overlayY + Math.round(overlayH * 0.08),
      width: width - pad * 2, height: Math.round(overlayH * 0.36),
      fontSize: Math.round(height * 0.1 * s), textAlign: 'left', color: textColor, zIndex: 10,
    },
    {
      type: 'subheadline', x: pad, y: overlayY + Math.round(overlayH * 0.46),
      width: Math.round(width * 0.7), height: Math.round(overlayH * 0.22),
      fontSize: Math.round(height * 0.06 * s), textAlign: 'left', color: textColor, zIndex: 10,
    },
    {
      type: 'cta', x: pad, y: overlayY + Math.round(overlayH * 0.7),
      width: Math.round(width * 0.32), height: Math.round(overlayH * 0.22),
      fontSize: Math.round(height * 0.055 * s), textAlign: 'center',
      backgroundColor: brandKit.primaryColor, color: '#ffffff', borderRadius: 6, zIndex: 10,
    },
  ]
}

// Keep old export name working
export const generateFallbackLayout = generateLayout

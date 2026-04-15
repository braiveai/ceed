import { ElementPlacement } from '@/types'
import { AdSpec } from './specs'

interface CopySet {
  headline: string
  subHeadline: string
  ctaText: string
}

interface BrandKit {
  primaryColor: string
  secondaryColor: string
  companyName: string
}

export function generateFallbackLayout(
  spec: AdSpec,
  copySet: CopySet,
  brandKit: BrandKit
): ElementPlacement[] {
  const { width, height } = spec
  const isWide = width > height * 2
  const isTall = height > width * 1.5
  const isSquare = Math.abs(width - height) < 100
  const isSmall = height < 150 || width < 200
  const isTiny = height < 80

  if (isTiny) {
    // Just CTA for very small formats
    return [
      {
        type: 'cta',
        x: Math.round(width * 0.05),
        y: Math.round(height * 0.1),
        width: Math.round(width * 0.9),
        height: Math.round(height * 0.8),
        fontSize: Math.max(10, Math.round(height * 0.35)),
        textAlign: 'center',
        backgroundColor: brandKit.primaryColor,
        color: '#ffffff',
        borderRadius: 4,
        zIndex: 10,
      },
    ]
  }

  if (isSmall) {
    return [
      {
        type: 'headline',
        x: Math.round(width * 0.03),
        y: Math.round(height * 0.1),
        width: Math.round(width * 0.6),
        height: Math.round(height * 0.5),
        fontSize: Math.max(12, Math.round(height * 0.3)),
        textAlign: 'left',
        color: '#ffffff',
        zIndex: 10,
      },
      {
        type: 'cta',
        x: Math.round(width * 0.65),
        y: Math.round(height * 0.15),
        width: Math.round(width * 0.3),
        height: Math.round(height * 0.7),
        fontSize: Math.max(10, Math.round(height * 0.28)),
        textAlign: 'center',
        backgroundColor: brandKit.primaryColor,
        color: '#ffffff',
        borderRadius: 4,
        zIndex: 10,
      },
    ]
  }

  if (isWide) {
    // Horizontal layout for leaderboards/banners
    const logoW = Math.round(width * 0.12)
    const logoH = Math.round(height * 0.5)
    return [
      { type: 'logo', x: Math.round(width * 0.02), y: Math.round(height * 0.25), width: logoW, height: logoH, zIndex: 10 },
      {
        type: 'headline',
        x: Math.round(width * 0.16),
        y: Math.round(height * 0.15),
        width: Math.round(width * 0.45),
        height: Math.round(height * 0.4),
        fontSize: Math.round(height * 0.32),
        textAlign: 'left',
        color: '#ffffff',
        zIndex: 10,
      },
      {
        type: 'subheadline',
        x: Math.round(width * 0.16),
        y: Math.round(height * 0.55),
        width: Math.round(width * 0.45),
        height: Math.round(height * 0.3),
        fontSize: Math.round(height * 0.22),
        textAlign: 'left',
        color: '#eeeeee',
        zIndex: 10,
      },
      {
        type: 'cta',
        x: Math.round(width * 0.73),
        y: Math.round(height * 0.2),
        width: Math.round(width * 0.22),
        height: Math.round(height * 0.6),
        fontSize: Math.round(height * 0.28),
        textAlign: 'center',
        backgroundColor: brandKit.primaryColor,
        color: '#ffffff',
        borderRadius: 6,
        zIndex: 10,
      },
    ]
  }

  if (isTall || isSquare) {
    // Vertical/stacked layout
    const overlayStart = Math.round(height * 0.55)
    const overlayH = Math.round(height * 0.45)
    const padding = Math.round(width * 0.05)
    const logoSize = Math.round(Math.min(width, height) * 0.08)

    return [
      {
        type: 'overlay',
        x: 0,
        y: overlayStart,
        width,
        height: overlayH,
        backgroundColor: '#000000',
        opacity: 0.5,
        zIndex: 5,
      },
      {
        type: 'logo',
        x: padding,
        y: padding,
        width: Math.round(logoSize * 3),
        height: logoSize,
        zIndex: 10,
      },
      {
        type: 'headline',
        x: padding,
        y: overlayStart + Math.round(overlayH * 0.05),
        width: width - padding * 2,
        height: Math.round(overlayH * 0.3),
        fontSize: Math.round(Math.min(width, height) * 0.055),
        textAlign: 'left',
        color: '#ffffff',
        zIndex: 10,
      },
      {
        type: 'subheadline',
        x: padding,
        y: overlayStart + Math.round(overlayH * 0.36),
        width: width - padding * 2,
        height: Math.round(overlayH * 0.2),
        fontSize: Math.round(Math.min(width, height) * 0.032),
        textAlign: 'left',
        color: '#dddddd',
        zIndex: 10,
      },
      {
        type: 'cta',
        x: padding,
        y: overlayStart + Math.round(overlayH * 0.6),
        width: Math.round(width * 0.45),
        height: Math.round(overlayH * 0.3),
        fontSize: Math.round(Math.min(width, height) * 0.03),
        textAlign: 'center',
        backgroundColor: brandKit.primaryColor,
        color: '#ffffff',
        borderRadius: 8,
        zIndex: 10,
      },
    ]
  }

  // Default landscape
  return [
    {
      type: 'overlay',
      x: 0,
      y: Math.round(height * 0.5),
      width,
      height: Math.round(height * 0.5),
      backgroundColor: '#000000',
      opacity: 0.5,
      zIndex: 5,
    },
    {
      type: 'logo',
      x: Math.round(width * 0.04),
      y: Math.round(height * 0.06),
      width: Math.round(width * 0.2),
      height: Math.round(height * 0.12),
      zIndex: 10,
    },
    {
      type: 'headline',
      x: Math.round(width * 0.04),
      y: Math.round(height * 0.54),
      width: Math.round(width * 0.9),
      height: Math.round(height * 0.2),
      fontSize: Math.round(height * 0.1),
      textAlign: 'left',
      color: '#ffffff',
      zIndex: 10,
    },
    {
      type: 'subheadline',
      x: Math.round(width * 0.04),
      y: Math.round(height * 0.72),
      width: Math.round(width * 0.65),
      height: Math.round(height * 0.12),
      fontSize: Math.round(height * 0.062),
      textAlign: 'left',
      color: '#eeeeee',
      zIndex: 10,
    },
    {
      type: 'cta',
      x: Math.round(width * 0.04),
      y: Math.round(height * 0.82),
      width: Math.round(width * 0.3),
      height: Math.round(height * 0.12),
      fontSize: Math.round(height * 0.055),
      textAlign: 'center',
      backgroundColor: brandKit.primaryColor,
      color: '#ffffff',
      borderRadius: 6,
      zIndex: 10,
    },
  ]
}

import { ElementPlacement, ImageAnalysis, StyleDefaults } from '@/types'
import { AdSpec } from './specs'
import { estimateTextHeight, fitFontSize } from './textUtils'

interface CopySet { headline: string; subHeadline: string; ctaText: string }
interface BrandKit { primaryColor: string; fontFamily: string }

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)) }

// Template 1: Overlay (dark band bottom or top)
export function overlayTemplate(spec: AdSpec, copy: CopySet, brand: BrandKit, style: StyleDefaults, analysis: ImageAnalysis): ElementPlacement[] {
  const { width, height } = spec
  const s = style.fontSizeScale
  const pad = clamp(Math.round(width * 0.055), 10, 48)
  const innerW = width - pad * 2
  const pos = style.overlayPosition === 'auto' ? (analysis.safeZone === 'top' ? 'top' : 'bottom') : style.overlayPosition

  const logoH = clamp(Math.round(height * 0.07), 18, 52)
  const logoW = logoH * 3.5
  const gap = Math.round(pad * 0.45)
  const ctaH = clamp(Math.round(height * 0.075), 26, 56)
  const ctaW = clamp(Math.round(innerW * 0.48), 70, 220)

  let hSize = clamp(Math.round(Math.min(width * 0.068, height * 0.088) * s), 12, 80)
  let subSize = clamp(Math.round(hSize * 0.58), 9, 36)
  const ctaFs = clamp(Math.round(hSize * 0.42), 9, 22)

  const minH = logoH + gap + ctaH + gap * 2 + pad * 2
  const textBudget = Math.round(height * 0.68) - minH
  hSize = fitFontSize(copy.headline, innerW, Math.round(textBudget * 0.58), hSize)
  subSize = fitFontSize(copy.subHeadline, innerW, Math.round(textBudget * 0.32), Math.round(hSize * 0.58))

  const hH = estimateTextHeight(copy.headline, hSize, innerW)
  const subH = estimateTextHeight(copy.subHeadline, subSize, innerW)
  const overlayH = clamp(pad + logoH + gap + hH + gap + subH + gap + ctaH + pad, minH, Math.round(height * 0.68))
  const overlayY = pos === 'top' ? 0 : height - overlayH

  let cursor = overlayY + pad
  const els: ElementPlacement[] = [
    { type: 'overlay', x: 0, y: overlayY, width, height: overlayH, backgroundColor: style.overlayColor, opacity: style.overlayOpacity, zIndex: 5 },
    { type: 'logo', x: pad, y: cursor, width: logoW, height: logoH, zIndex: 10 },
  ]
  cursor += logoH + gap
  els.push({ type: 'headline', x: pad, y: cursor, width: innerW, height: hH + 4, fontSize: hSize, textAlign: 'left', color: style.textColor, zIndex: 10 })
  cursor += hH + gap
  els.push({ type: 'subheadline', x: pad, y: cursor, width: innerW, height: subH + 4, fontSize: subSize, textAlign: 'left', color: style.textColor, zIndex: 10 })
  cursor += subH + gap
  els.push({ type: 'cta', x: pad, y: cursor, width: ctaW, height: ctaH, fontSize: ctaFs, textAlign: 'center', backgroundColor: brand.primaryColor, color: '#ffffff', borderRadius: 8, zIndex: 10 })
  return els
}

// Template 2: Split — solid colour panel left, image right
export function splitTemplate(spec: AdSpec, copy: CopySet, brand: BrandKit, style: StyleDefaults, analysis: ImageAnalysis): ElementPlacement[] {
  const { width, height } = spec
  const s = style.fontSizeScale
  const panelW = Math.round(width * (analysis.subjectPosition === 'right' ? 0.42 : 0.42))
  const pad = clamp(Math.round(panelW * 0.1), 12, 36)
  const innerW = panelW - pad * 2

  const logoH = clamp(Math.round(height * 0.06), 16, 40)
  const logoW = logoH * 3.5
  const ctaH = clamp(Math.round(height * 0.08), 28, 52)
  const ctaW = clamp(Math.round(innerW * 0.85), 60, 200)
  const gap = Math.round(pad * 0.4)

  let hSize = fitFontSize(copy.headline, innerW, Math.round(height * 0.32 * s), clamp(Math.round(height * 0.08 * s), 12, 56))
  let subSize = fitFontSize(copy.subHeadline, innerW, Math.round(height * 0.18 * s), clamp(Math.round(hSize * 0.55), 9, 28))
  const ctaFs = clamp(Math.round(hSize * 0.4), 9, 18)

  const hH = estimateTextHeight(copy.headline, hSize, innerW)
  const subH = estimateTextHeight(copy.subHeadline, subSize, innerW)
  const totalH = logoH + gap + hH + gap + subH + gap + ctaH
  const startY = Math.round((height - totalH) / 2)

  let cursor = startY
  return [
    { type: 'overlay', x: 0, y: 0, width: panelW, height, backgroundColor: style.overlayColor, opacity: 0.92, zIndex: 5 },
    { type: 'logo', x: pad, y: cursor, width: logoW, height: logoH, zIndex: 10 },
    ...(() => { cursor += logoH + gap; return [] })(),
    { type: 'headline', x: pad, y: (() => { const y = cursor; cursor += hH + gap; return y })(), width: innerW, height: hH + 4, fontSize: hSize, textAlign: 'left', color: style.textColor, zIndex: 10 },
    { type: 'subheadline', x: pad, y: (() => { const y = cursor; cursor += subH + gap; return y })(), width: innerW, height: subH + 4, fontSize: subSize, textAlign: 'left', color: style.textColor, zIndex: 10 },
    { type: 'cta', x: pad, y: cursor, width: ctaW, height: ctaH, fontSize: ctaFs, textAlign: 'center', backgroundColor: brand.primaryColor, color: '#ffffff', borderRadius: 8, zIndex: 10 },
  ]
}

// Template 3: Floating — text with drop shadow, no overlay band
export function floatingTemplate(spec: AdSpec, copy: CopySet, brand: BrandKit, style: StyleDefaults, analysis: ImageAnalysis): ElementPlacement[] {
  const { width, height } = spec
  const s = style.fontSizeScale
  const pad = clamp(Math.round(width * 0.06), 12, 48)
  const innerW = width - pad * 2
  const pos = analysis.safeZone === 'top' ? 'top' : 'bottom'

  const logoH = clamp(Math.round(height * 0.065), 16, 44)
  const logoW = logoH * 3.5
  const ctaH = clamp(Math.round(height * 0.07), 26, 50)
  const ctaW = clamp(Math.round(innerW * 0.44), 60, 200)
  const gap = Math.round(pad * 0.4)

  let hSize = fitFontSize(copy.headline, innerW, Math.round(height * 0.25 * s), clamp(Math.round(height * 0.075 * s), 12, 64))
  let subSize = fitFontSize(copy.subHeadline, innerW, Math.round(height * 0.14 * s), clamp(Math.round(hSize * 0.55), 9, 28))
  const ctaFs = clamp(Math.round(hSize * 0.38), 9, 18)

  const hH = estimateTextHeight(copy.headline, hSize, innerW)
  const subH = estimateTextHeight(copy.subHeadline, subSize, innerW)

  const startY = pos === 'top' ? pad : height - (logoH + gap + hH + gap + subH + gap + ctaH + pad)
  let cursor = startY

  return [
    { type: 'logo', x: pad, y: cursor, width: logoW, height: logoH, zIndex: 10 },
    ...(() => { cursor += logoH + gap; return [] })(),
    { type: 'headline', x: pad, y: (() => { const y = cursor; cursor += hH + gap; return y })(), width: innerW, height: hH + 4, fontSize: hSize, textAlign: 'left', color: analysis.brightness === 'light' ? '#111111' : '#ffffff', zIndex: 10 },
    { type: 'subheadline', x: pad, y: (() => { const y = cursor; cursor += subH + gap; return y })(), width: innerW, height: subH + 4, fontSize: subSize, textAlign: 'left', color: analysis.brightness === 'light' ? '#333333' : '#eeeeee', zIndex: 10 },
    { type: 'cta', x: pad, y: cursor, width: ctaW, height: ctaH, fontSize: ctaFs, textAlign: 'center', backgroundColor: brand.primaryColor, color: '#ffffff', borderRadius: 8, zIndex: 10 },
  ]
}

// Template 4: Bottom bar — thin solid strip at bottom, CTA + logo only
export function bottomBarTemplate(spec: AdSpec, copy: CopySet, brand: BrandKit, style: StyleDefaults): ElementPlacement[] {
  const { width, height } = spec
  const s = style.fontSizeScale
  const barH = clamp(Math.round(height * 0.2), 40, 100)
  const pad = clamp(Math.round(width * 0.04), 8, 32)
  const innerW = width - pad * 2
  const logoH = clamp(Math.round(barH * 0.38), 14, 36)
  const logoW = logoH * 3.5
  const ctaH = clamp(Math.round(barH * 0.55), 22, 48)
  const ctaW = clamp(Math.round(width * 0.28), 60, 180)
  const ctaFs = clamp(Math.round(ctaH * 0.38 * s), 9, 18)

  // Headline floats on image above the bar
  let hSize = fitFontSize(copy.headline, innerW, Math.round(height * 0.28 * s), clamp(Math.round(height * 0.08 * s), 12, 64))
  const hH = estimateTextHeight(copy.headline, hSize, innerW)

  return [
    { type: 'headline', x: pad, y: Math.round(height * 0.08), width: innerW, height: hH + 4, fontSize: hSize, textAlign: 'left', color: '#ffffff', zIndex: 10 },
    { type: 'overlay', x: 0, y: height - barH, width, height: barH, backgroundColor: style.overlayColor, opacity: 0.95, zIndex: 5 },
    { type: 'logo', x: pad, y: height - barH + Math.round((barH - logoH) / 2), width: logoW, height: logoH, zIndex: 10 },
    { type: 'cta', x: width - ctaW - pad, y: height - barH + Math.round((barH - ctaH) / 2), width: ctaW, height: ctaH, fontSize: ctaFs, textAlign: 'center', backgroundColor: brand.primaryColor, color: '#ffffff', borderRadius: 6, zIndex: 10 },
  ]
}

// Template 5: Bold centred — large centred headline, great for stories/square
export function boldCentredTemplate(spec: AdSpec, copy: CopySet, brand: BrandKit, style: StyleDefaults): ElementPlacement[] {
  const { width, height } = spec
  const s = style.fontSizeScale
  const pad = clamp(Math.round(width * 0.07), 12, 56)
  const innerW = width - pad * 2

  const logoH = clamp(Math.round(height * 0.055), 14, 40)
  const logoW = logoH * 3.5
  const ctaH = clamp(Math.round(height * 0.065), 26, 52)
  const ctaW = clamp(Math.round(innerW * 0.5), 80, 220)
  const gap = Math.round(pad * 0.35)

  let hSize = fitFontSize(copy.headline, innerW, Math.round(height * 0.35 * s), clamp(Math.round(Math.min(width, height) * 0.09 * s), 14, 80))
  let subSize = fitFontSize(copy.subHeadline, innerW, Math.round(height * 0.16 * s), clamp(Math.round(hSize * 0.52), 9, 28))
  const ctaFs = clamp(Math.round(hSize * 0.36), 9, 20)

  const hH = estimateTextHeight(copy.headline, hSize, innerW)
  const subH = estimateTextHeight(copy.subHeadline, subSize, innerW)
  const totalTextH = hH + gap + subH + gap + ctaH
  const textStartY = Math.round((height - totalTextH) / 2)

  return [
    { type: 'overlay', x: 0, y: 0, width, height, backgroundColor: style.overlayColor, opacity: style.overlayOpacity * 0.6, zIndex: 5 },
    { type: 'logo', x: pad, y: Math.round(pad * 0.8), width: logoW, height: logoH, zIndex: 10 },
    { type: 'headline', x: pad, y: textStartY, width: innerW, height: hH + 4, fontSize: hSize, textAlign: 'center', color: style.textColor, zIndex: 10 },
    { type: 'subheadline', x: pad, y: textStartY + hH + gap, width: innerW, height: subH + 4, fontSize: subSize, textAlign: 'center', color: style.textColor, zIndex: 10 },
    { type: 'cta', x: Math.round((width - ctaW) / 2), y: textStartY + hH + gap + subH + gap, width: ctaW, height: ctaH, fontSize: ctaFs, textAlign: 'center', backgroundColor: brand.primaryColor, color: '#ffffff', borderRadius: 24, zIndex: 10 },
  ]
}

export type TemplateName = 'overlay' | 'split' | 'floating' | 'bottom-bar' | 'bold-centred'

export const TEMPLATES: { id: TemplateName; label: string; description: string }[] = [
  { id: 'overlay', label: 'Overlay', description: 'Dark band with text, classic and safe' },
  { id: 'split', label: 'Split', description: 'Solid panel left, image right' },
  { id: 'floating', label: 'Floating', description: 'Text on image, no overlay band' },
  { id: 'bottom-bar', label: 'Bottom Bar', description: 'Minimal strip at bottom, clean' },
  { id: 'bold-centred', label: 'Bold Centred', description: 'Large centred headline, great for stories' },
]

export function pickBestTemplate(spec: AdSpec, analysis: ImageAnalysis): TemplateName {
  const { width, height } = spec
  const isWide = width / height > 2.2
  const isTall = height / width > 1.4
  const isSquare = !isWide && !isTall

  if (isWide) return 'overlay'
  if (analysis.subjectPosition === 'center' && isSquare) return 'bold-centred'
  if (analysis.subjectPosition === 'right' || analysis.subjectPosition === 'left') return 'split'
  if (analysis.brightness === 'mixed' && isTall) return 'bottom-bar'
  if (analysis.brightness === 'light' || analysis.brightness === 'dark') return 'floating'
  return 'overlay'
}

export function applyTemplate(
  template: TemplateName,
  spec: AdSpec,
  copy: CopySet,
  brand: BrandKit,
  style: StyleDefaults,
  analysis: ImageAnalysis
): ElementPlacement[] {
  const { width, height } = spec
  const isWide = width / height > 2.2
  const isTiny = height < 80

  if (isTiny || isWide) return overlayTemplate(spec, copy, brand, style, analysis)

  switch (template) {
    case 'split': return splitTemplate(spec, copy, brand, style, analysis)
    case 'floating': return floatingTemplate(spec, copy, brand, style, analysis)
    case 'bottom-bar': return bottomBarTemplate(spec, copy, brand, style)
    case 'bold-centred': return boldCentredTemplate(spec, copy, brand, style)
    default: return overlayTemplate(spec, copy, brand, style, analysis)
  }
}

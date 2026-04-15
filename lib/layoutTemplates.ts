import { ElementPlacement, ImageAnalysis, StyleDefaults } from '@/types'
import { AdSpec } from './specs'
import { estimateTextHeight, fitFontSize } from './textUtils'

interface CopySet { headline: string; subHeadline: string; ctaText: string }
interface BrandKit { primaryColor: string; fontFamily: string }

const MIN_CTA_H = 44
const MIN_CTA_W = 80
function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)) }

// Logo placement conventions per platform family
function logoPos(spec: AdSpec, overlayY: number, overlayH: number, overlayPos: 'top'|'bottom', pad: number, logoW: number, logoH: number, width: number, height: number) {
  const id = spec.id
  // Stories/vertical: top-left inside overlay
  if (id.includes('stories') || id.includes('topview') || id.includes('takeover') || id.includes('snap') || id.includes('idea')) {
    return { x: pad, y: overlayPos === 'top' ? overlayY + pad * 0.7 : overlayY + pad * 0.7 }
  }
  // Display banners: left side, vertically centred
  if (height < 120) return { x: pad, y: Math.round((height - logoH) / 2) }
  // Default: inside overlay, top
  return { x: pad, y: overlayY + pad * 0.7 }
}

export function overlayTemplate(spec: AdSpec, copy: CopySet, brand: BrandKit, style: StyleDefaults, analysis: ImageAnalysis): ElementPlacement[] {
  const { width, height } = spec
  const s = style.fontSizeScale
  const pad = clamp(Math.round(width * 0.055), 10, 48)
  const innerW = width - pad * 2
  const pos: 'top'|'bottom' = style.overlayPosition === 'auto' ? (analysis.safeZone === 'top' ? 'top' : 'bottom') : style.overlayPosition as 'top'|'bottom'

  const logoH = clamp(Math.round(height * 0.07), 18, 52)
  const logoW = logoH * 3.5
  const gap = Math.round(pad * 0.45)
  const ctaH = clamp(Math.round(height * 0.075), MIN_CTA_H, 60)
  const ctaW = clamp(Math.round(innerW * 0.48), MIN_CTA_W, 220)
  const ctaFs = clamp(Math.round(ctaH * 0.38 * s), 9, 22)

  let hSize = clamp(Math.round(Math.min(width * 0.068, height * 0.088) * s), 12, 80)
  let subSize = clamp(Math.round(hSize * 0.58), 9, 36)
  const minH = logoH + gap + ctaH + gap * 2 + pad * 2
  const textBudget = Math.round(height * 0.68) - minH

  hSize = fitFontSize(copy.headline, innerW, Math.round(textBudget * 0.55), hSize)
  subSize = fitFontSize(copy.subHeadline, innerW, Math.round(textBudget * 0.3), Math.round(hSize * 0.58))

  const hH = estimateTextHeight(copy.headline, hSize, innerW) + 4
  const subH = estimateTextHeight(copy.subHeadline, subSize, innerW) + 4
  const overlayH = clamp(pad + logoH + gap + hH + gap + subH + gap + ctaH + pad, minH, Math.round(height * 0.68))
  const overlayY = pos === 'top' ? 0 : height - overlayH
  const lp = logoPos(spec, overlayY, overlayH, pos, pad, logoW, logoH, width, height)

  let cursor = overlayY + pad
  const els: ElementPlacement[] = [
    { type: 'overlay', x: 0, y: overlayY, width, height: overlayH, backgroundColor: style.overlayColor, opacity: style.overlayOpacity, zIndex: 5 },
    { type: 'logo', x: lp.x, y: lp.y, width: logoW, height: logoH, zIndex: 10 },
  ]
  cursor += logoH + gap
  els.push({ type: 'headline', x: pad, y: cursor, width: innerW, height: hH, fontSize: hSize, textAlign: 'left', color: style.textColor, zIndex: 10 })
  cursor += hH + gap
  els.push({ type: 'subheadline', x: pad, y: cursor, width: innerW, height: subH, fontSize: subSize, textAlign: 'left', color: style.textColor, zIndex: 10 })
  cursor += subH + gap
  els.push({ type: 'cta', x: pad, y: cursor, width: ctaW, height: ctaH, fontSize: ctaFs, textAlign: 'center', backgroundColor: brand.primaryColor, color: '#ffffff', borderRadius: 8, zIndex: 10 })
  return els
}

export function splitTemplate(spec: AdSpec, copy: CopySet, brand: BrandKit, style: StyleDefaults, analysis: ImageAnalysis): ElementPlacement[] {
  const { width, height } = spec
  const s = style.fontSizeScale
  const panelW = Math.round(width * 0.44)
  const pad = clamp(Math.round(panelW * 0.1), 12, 36)
  const innerW = panelW - pad * 2

  const logoH = clamp(Math.round(height * 0.065), 16, 44)
  const logoW = logoH * 3.5
  const ctaH = clamp(Math.round(height * 0.08), MIN_CTA_H, 56)
  const ctaW = clamp(Math.round(innerW * 0.88), MIN_CTA_W, 200)
  const gap = Math.round(pad * 0.4)

  let hSize = fitFontSize(copy.headline, innerW, Math.round(height * 0.3 * s), clamp(Math.round(height * 0.075 * s), 12, 56))
  let subSize = fitFontSize(copy.subHeadline, innerW, Math.round(height * 0.18 * s), clamp(Math.round(hSize * 0.56), 9, 28))
  const ctaFs = clamp(Math.round(ctaH * 0.4), 9, 18)

  const hH = estimateTextHeight(copy.headline, hSize, innerW) + 4
  const subH = estimateTextHeight(copy.subHeadline, subSize, innerW) + 4
  const totalH = logoH + gap + hH + gap + subH + gap + ctaH
  let cursor = Math.round((height - totalH) / 2)

  return [
    { type: 'overlay', x: 0, y: 0, width: panelW, height, backgroundColor: style.overlayColor, opacity: 0.92, zIndex: 5 },
    { type: 'logo', x: pad, y: cursor, width: logoW, height: logoH, zIndex: 10 },
    { type: 'headline', x: pad, y: (() => { cursor += logoH + gap; return cursor })(), width: innerW, height: hH, fontSize: hSize, textAlign: 'left', color: style.textColor, zIndex: 10 },
    { type: 'subheadline', x: pad, y: (() => { cursor += hH + gap; return cursor })(), width: innerW, height: subH, fontSize: subSize, textAlign: 'left', color: style.textColor, zIndex: 10 },
    { type: 'cta', x: pad, y: (() => { cursor += subH + gap; return cursor })(), width: ctaW, height: ctaH, fontSize: ctaFs, textAlign: 'center', backgroundColor: brand.primaryColor, color: '#ffffff', borderRadius: 8, zIndex: 10 },
  ]
}

export function floatingTemplate(spec: AdSpec, copy: CopySet, brand: BrandKit, style: StyleDefaults, analysis: ImageAnalysis): ElementPlacement[] {
  const { width, height } = spec
  const s = style.fontSizeScale
  const pad = clamp(Math.round(width * 0.06), 12, 48)
  const innerW = width - pad * 2
  const pos: 'top'|'bottom' = analysis.safeZone === 'top' ? 'top' : 'bottom'
  const onLight = analysis.brightness === 'light'

  const logoH = clamp(Math.round(height * 0.065), 16, 44)
  const logoW = logoH * 3.5
  const ctaH = clamp(Math.round(height * 0.075), MIN_CTA_H, 52)
  const ctaW = clamp(Math.round(innerW * 0.46), MIN_CTA_W, 200)
  const gap = Math.round(pad * 0.4)

  let hSize = fitFontSize(copy.headline, innerW, Math.round(height * 0.28 * s), clamp(Math.round(height * 0.076 * s), 12, 64))
  let subSize = fitFontSize(copy.subHeadline, innerW, Math.round(height * 0.16 * s), clamp(Math.round(hSize * 0.56), 9, 28))
  const ctaFs = clamp(Math.round(ctaH * 0.38), 9, 18)

  const hH = estimateTextHeight(copy.headline, hSize, innerW) + 4
  const subH = estimateTextHeight(copy.subHeadline, subSize, innerW) + 4
  const startY = pos === 'top' ? pad : height - (logoH + gap + hH + gap + subH + gap + ctaH + pad)
  let cursor = startY

  const textColor = onLight ? '#111111' : '#ffffff'
  const subColor = onLight ? '#333333' : '#eeeeee'
  // Shadow for readability on image
  const shadow = { shadowColor: onLight ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)', shadowBlur: 8, shadowOffsetX: 0, shadowOffsetY: 1 }

  return [
    { type: 'logo', x: pad, y: cursor, width: logoW, height: logoH, zIndex: 10 },
    { type: 'headline', x: pad, y: (() => { cursor += logoH + gap; return cursor })(), width: innerW, height: hH, fontSize: hSize, textAlign: 'left', color: textColor, zIndex: 10, ...shadow },
    { type: 'subheadline', x: pad, y: (() => { cursor += hH + gap; return cursor })(), width: innerW, height: subH, fontSize: subSize, textAlign: 'left', color: subColor, zIndex: 10, ...shadow },
    { type: 'cta', x: pad, y: (() => { cursor += subH + gap; return cursor })(), width: ctaW, height: ctaH, fontSize: ctaFs, textAlign: 'center', backgroundColor: brand.primaryColor, color: '#ffffff', borderRadius: 8, zIndex: 10 },
  ]
}

export function bottomBarTemplate(spec: AdSpec, copy: CopySet, brand: BrandKit, style: StyleDefaults): ElementPlacement[] {
  const { width, height } = spec
  const s = style.fontSizeScale
  const barH = clamp(Math.round(height * 0.2), MIN_CTA_H + 8, 100)
  const pad = clamp(Math.round(width * 0.04), 8, 32)
  const innerW = width - pad * 2
  const logoH = clamp(Math.round(barH * 0.38), 14, 36)
  const logoW = logoH * 3.5
  const ctaH = clamp(Math.round(barH * 0.55), MIN_CTA_H, 52)
  const ctaW = clamp(Math.round(width * 0.28), MIN_CTA_W, 180)

  let hSize = fitFontSize(copy.headline, innerW, Math.round(height * 0.3 * s), clamp(Math.round(height * 0.08 * s), 12, 64))
  const hH = estimateTextHeight(copy.headline, hSize, innerW) + 4

  return [
    { type: 'headline', x: pad, y: Math.round(height * 0.07), width: innerW, height: hH, fontSize: hSize, textAlign: 'left', color: '#ffffff', zIndex: 10, shadowColor: 'rgba(0,0,0,0.6)', shadowBlur: 10 },
    { type: 'overlay', x: 0, y: height - barH, width, height: barH, backgroundColor: style.overlayColor, opacity: 0.96, zIndex: 5 },
    { type: 'logo', x: pad, y: height - barH + Math.round((barH - logoH) / 2), width: logoW, height: logoH, zIndex: 10 },
    { type: 'cta', x: width - ctaW - pad, y: height - barH + Math.round((barH - ctaH) / 2), width: ctaW, height: ctaH, fontSize: clamp(Math.round(ctaH * 0.38 * s), 9, 16), textAlign: 'center', backgroundColor: brand.primaryColor, color: '#ffffff', borderRadius: 6, zIndex: 10 },
  ]
}

export function boldCentredTemplate(spec: AdSpec, copy: CopySet, brand: BrandKit, style: StyleDefaults): ElementPlacement[] {
  const { width, height } = spec
  const s = style.fontSizeScale
  const pad = clamp(Math.round(width * 0.07), 12, 56)
  const innerW = width - pad * 2

  const logoH = clamp(Math.round(height * 0.055), 14, 40)
  const logoW = logoH * 3.5
  const ctaH = clamp(Math.round(height * 0.07), MIN_CTA_H, 56)
  const ctaW = clamp(Math.round(innerW * 0.52), MIN_CTA_W, 220)
  const gap = Math.round(pad * 0.35)

  let hSize = fitFontSize(copy.headline, innerW, Math.round(height * 0.38 * s), clamp(Math.round(Math.min(width, height) * 0.09 * s), 14, 80))
  let subSize = fitFontSize(copy.subHeadline, innerW, Math.round(height * 0.18 * s), clamp(Math.round(hSize * 0.52), 9, 28))
  const ctaFs = clamp(Math.round(ctaH * 0.38 * s), 9, 20)

  const hH = estimateTextHeight(copy.headline, hSize, innerW) + 4
  const subH = estimateTextHeight(copy.subHeadline, subSize, innerW) + 4
  const totalTextH = hH + gap + subH + gap + ctaH
  const textStartY = Math.round((height - totalTextH) / 2)

  return [
    { type: 'overlay', x: 0, y: 0, width, height, backgroundColor: style.overlayColor, opacity: style.overlayOpacity * 0.6, zIndex: 5 },
    { type: 'logo', x: pad, y: Math.round(pad * 0.8), width: logoW, height: logoH, zIndex: 10 },
    { type: 'headline', x: pad, y: textStartY, width: innerW, height: hH, fontSize: hSize, textAlign: 'center', color: style.textColor, zIndex: 10 },
    { type: 'subheadline', x: pad, y: textStartY + hH + gap, width: innerW, height: subH, fontSize: subSize, textAlign: 'center', color: style.textColor, zIndex: 10 },
    { type: 'cta', x: Math.round((width - ctaW) / 2), y: textStartY + hH + gap + subH + gap, width: ctaW, height: ctaH, fontSize: ctaFs, textAlign: 'center', backgroundColor: brand.primaryColor, color: '#ffffff', borderRadius: 24, zIndex: 10 },
  ]
}

export type TemplateName = 'overlay' | 'split' | 'floating' | 'bottom-bar' | 'bold-centred'

export const TEMPLATES: { id: TemplateName; label: string; description: string }[] = [
  { id: 'overlay', label: 'Overlay', description: 'Dark band with text, classic and safe' },
  { id: 'split', label: 'Split', description: 'Solid panel left, image right' },
  { id: 'floating', label: 'Floating', description: 'Text on image with shadow, clean' },
  { id: 'bottom-bar', label: 'Bottom Bar', description: 'Minimal strip at bottom' },
  { id: 'bold-centred', label: 'Bold Centred', description: 'Large centred headline' },
]

export function pickBestTemplate(spec: AdSpec, analysis: ImageAnalysis): TemplateName {
  const { width, height } = spec
  const isWide = width / height > 2.2
  const isTall = height / width > 1.4
  const isSquare = !isWide && !isTall
  if (isWide) return 'overlay'
  if (analysis.subjectPosition === 'center' && (isTall || isSquare)) return 'bold-centred'
  if ((analysis.subjectPosition === 'right' || analysis.subjectPosition === 'left') && isSquare) return 'split'
  if (analysis.brightness !== 'mixed' && isTall) return 'floating'
  return 'overlay'
}

export function applyTemplate(template: TemplateName, spec: AdSpec, copy: CopySet, brand: BrandKit, style: StyleDefaults, analysis: ImageAnalysis): ElementPlacement[] {
  const { width, height } = spec
  const isWide = width / height > 2.2
  const isTiny = height < 80
  const isNarrow = width < 180

  if (isTiny || isWide) return overlayTemplate(spec, copy, brand, style, analysis)
  if (isNarrow) return overlayTemplate(spec, copy, brand, { ...style, fontSizeScale: style.fontSizeScale * Math.min(1, width / 160) }, analysis)

  switch (template) {
    case 'split': return splitTemplate(spec, copy, brand, style, analysis)
    case 'floating': return floatingTemplate(spec, copy, brand, style, analysis)
    case 'bottom-bar': return bottomBarTemplate(spec, copy, brand, style)
    case 'bold-centred': return boldCentredTemplate(spec, copy, brand, style)
    default: return overlayTemplate(spec, copy, brand, style, analysis)
  }
}

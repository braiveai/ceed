import { ElementPlacement, ImageAnalysis, StyleDefaults } from '@/types'
import { AdSpec } from './specs'
import { applyTemplate, pickBestTemplate, TemplateName, overlayTemplate } from './layoutTemplates'

interface CopySet { headline: string; subHeadline: string; ctaText: string }
interface BrandKit { primaryColor: string; secondaryColor: string; fontFamily: string; companyName: string }

const DEFAULT_ANALYSIS: ImageAnalysis = {
  subjectPosition: 'center', safeZone: 'bottom', brightness: 'dark',
  textColor: '#ffffff', dominantBgColor: '#000000'
}
const DEFAULT_STYLE: StyleDefaults = {
  fontSizeScale: 1, overlayOpacity: 0.5, overlayPosition: 'auto',
  textColor: '#ffffff', overlayColor: '#000000', template: 'auto'
}

export function generateLayout(
  spec: AdSpec, copySet: CopySet, brandKit: BrandKit,
  analysis: ImageAnalysis = DEFAULT_ANALYSIS, style: StyleDefaults = DEFAULT_STYLE
): ElementPlacement[] {
  const template: TemplateName = style.template === 'auto'
    ? pickBestTemplate(spec, analysis)
    : style.template as TemplateName
  return applyTemplate(template, spec, copySet, brandKit, style, analysis)
}

export function generateLogoLayout(spec: AdSpec, brandKit: BrandKit, style: StyleDefaults): ElementPlacement[] {
  const { width, height } = spec
  const pad = Math.round(Math.min(width, height) * 0.12)
  return [
    { type: 'overlay', x: 0, y: 0, width, height, backgroundColor: style.overlayColor, opacity: 0.12, zIndex: 2 },
    { type: 'logo', x: pad, y: Math.round((height - height * 0.38) / 2), width: width - pad * 2, height: Math.round(height * 0.38), zIndex: 10 },
  ]
}

export const LOGO_ONLY_SPECS = ['pmax-logo-square', 'pmax-logo-landscape']
export const generateFallbackLayout = generateLayout

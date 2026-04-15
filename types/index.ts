export interface BrandKit {
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  companyName: string
}

export interface CopySet {
  headline: string
  subHeadline: string
  ctaText: string
  bodyText?: string
}

export interface StyleDefaults {
  fontSizeScale: number
  overlayOpacity: number
  overlayPosition: 'top' | 'bottom' | 'auto'
  textColor: string
  overlayColor: string
  template: 'overlay' | 'split' | 'floating' | 'bottom-bar' | 'bold-centred' | 'auto'
}

export interface ImageAnalysis {
  subjectPosition: 'left' | 'center' | 'right' | 'full'
  safeZone: 'top' | 'bottom' | 'left' | 'right'
  brightness: 'light' | 'dark' | 'mixed'
  textColor: string
  dominantBgColor: string
  suggestedCtaColor?: string
}

export interface ElementPlacement {
  type: 'image' | 'logo' | 'headline' | 'subheadline' | 'cta' | 'overlay'
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
  textAlign?: 'left' | 'center' | 'right'
  color?: string
  backgroundColor?: string
  borderRadius?: number
  opacity?: number
  zIndex?: number
}

export interface ElementOverride {
  fontSize?: number
  color?: string
  backgroundColor?: string
  textAlign?: 'left' | 'center' | 'right'
  opacity?: number
  borderRadius?: number
  fontStyle?: string
  // Position/size overrides (set when user drags or resizes)
  x?: number
  y?: number
  width?: number
  height?: number
}

export interface CopyVariant {
  label: string
  headline: string
  subHeadline: string
  ctaText: string
}

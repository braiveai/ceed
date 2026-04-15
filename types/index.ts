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

export interface CanvasLayout {
  specId: string
  elements: ElementPlacement[]
}

export interface GeneratedAd {
  specId: string
  layout: CanvasLayout
  dataUrl?: string
}

export interface CeedProject {
  id: string
  brandKit: BrandKit
  copySet: CopySet
  uploadedImageUrl: string | null
  selectedSpecSets: string[]
  generatedAds: GeneratedAd[]
  createdAt: Date
}

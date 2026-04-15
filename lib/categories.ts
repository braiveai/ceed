import { SPEC_SETS, SpecSet } from './specs'

export interface PlatformCategory {
  id: string
  label: string
  description: string
  platformIds: string[]
  color: string
}

export const PLATFORM_CATEGORIES: PlatformCategory[] = [
  {
    id: 'social',
    label: 'Social',
    description: 'Meta, LinkedIn, TikTok, Snapchat, Pinterest, X',
    platformIds: ['meta', 'linkedin', 'tiktok', 'snapchat', 'pinterest', 'twitter'],
    color: '#6366F1',
  },
  {
    id: 'google',
    label: 'Google',
    description: 'Performance Max, Display Network, YouTube',
    platformIds: ['pmax', 'display-core', 'display-extended', 'youtube'],
    color: '#4285F4',
  },
  {
    id: 'programmatic',
    label: 'Programmatic',
    description: 'DV360, Trade Desk, general programmatic',
    platformIds: ['programmatic'],
    color: '#8B5CF6',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Email marketing, out-of-home digital',
    platformIds: ['email', 'ooh'],
    color: '#10B981',
  },
]

export function getSpecsForCategory(categoryId: string): SpecSet[] {
  const cat = PLATFORM_CATEGORIES.find(c => c.id === categoryId)
  if (!cat) return []
  return SPEC_SETS.filter(s => cat.platformIds.includes(s.id))
}

export function getCategoryForPlatform(platformId: string): PlatformCategory | undefined {
  return PLATFORM_CATEGORIES.find(c => c.platformIds.includes(platformId))
}

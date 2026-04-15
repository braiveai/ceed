export interface SafeZone {
  top: number    // fraction of height (0-1)
  bottom: number
  left: number
  right: number
  label?: string
}

// Platform safe zones — areas covered by UI chrome
export const SAFE_ZONES: Record<string, SafeZone> = {
  'meta-stories':        { top: 0.14, bottom: 0.20, left: 0.05, right: 0.05, label: 'Meta Stories safe zone' },
  'meta-feed-portrait':  { top: 0.02, bottom: 0.12, left: 0.02, right: 0.02, label: 'Feed safe zone' },
  'tt-infeed-vertical':  { top: 0.10, bottom: 0.26, left: 0.05, right: 0.14, label: 'TikTok safe zone' },
  'tt-topview':          { top: 0.10, bottom: 0.26, left: 0.05, right: 0.14, label: 'TikTok safe zone' },
  'tt-brand-takeover':   { top: 0.10, bottom: 0.26, left: 0.05, right: 0.14, label: 'TikTok safe zone' },
  'snap-single':         { top: 0.10, bottom: 0.20, left: 0.04, right: 0.04, label: 'Snapchat safe zone' },
  'snap-collection':     { top: 0.10, bottom: 0.20, left: 0.04, right: 0.04, label: 'Snapchat safe zone' },
  'pin-idea':            { top: 0.08, bottom: 0.16, left: 0.04, right: 0.04, label: 'Idea Pin safe zone' },
  'li-story':            { top: 0.10, bottom: 0.15, left: 0.04, right: 0.04, label: 'LinkedIn safe zone' },
  'yt-masthead':         { top: 0.08, bottom: 0.12, left: 0.04, right: 0.04, label: 'YouTube safe zone' },
  'ooh-street-portrait': { top: 0.04, bottom: 0.04, left: 0.06, right: 0.06, label: 'OOH safe zone' },
}

export function getSafeZone(specId: string): SafeZone | null {
  return SAFE_ZONES[specId] || null
}

export function getSafeRect(specId: string, width: number, height: number) {
  const sz = getSafeZone(specId)
  if (!sz) return null
  return {
    x: Math.round(width * sz.left),
    y: Math.round(height * sz.top),
    width: Math.round(width * (1 - sz.left - sz.right)),
    height: Math.round(height * (1 - sz.top - sz.bottom)),
    label: sz.label,
  }
}

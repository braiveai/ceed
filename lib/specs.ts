export interface AdSpec {
  id: string
  name: string
  width: number
  height: number
  platform: string
  placement: string
}

export interface SpecSet {
  id: string
  label: string
  platform: string
  color: string
  specs: AdSpec[]
}

export const SPEC_SETS: SpecSet[] = [
  {
    id: 'meta',
    label: 'Meta',
    platform: 'Meta (Facebook + Instagram)',
    color: '#1877F2',
    specs: [
      { id: 'meta-feed-square', name: 'Feed Square', width: 1080, height: 1080, platform: 'Meta', placement: 'FB + IG Feed' },
      { id: 'meta-feed-landscape', name: 'Feed Landscape', width: 1200, height: 628, platform: 'Meta', placement: 'FB Feed' },
      { id: 'meta-feed-portrait', name: 'Feed Portrait', width: 1080, height: 1350, platform: 'Meta', placement: 'FB + IG Feed' },
      { id: 'meta-stories', name: 'Stories / Reels', width: 1080, height: 1920, platform: 'Meta', placement: 'FB + IG Stories, Reels' },
      { id: 'meta-carousel', name: 'Carousel Card', width: 1080, height: 1080, platform: 'Meta', placement: 'FB + IG Carousel' },
      { id: 'meta-right-column', name: 'Right Column', width: 1200, height: 628, platform: 'Meta', placement: 'FB Desktop' },
      { id: 'meta-marketplace', name: 'Marketplace', width: 1080, height: 1080, platform: 'Meta', placement: 'FB Marketplace' },
      { id: 'meta-instream', name: 'In-Stream Thumbnail', width: 1280, height: 720, platform: 'Meta', placement: 'FB In-Stream' },
    ]
  },
  {
    id: 'pmax',
    label: 'PMax',
    platform: 'Google Performance Max',
    color: '#4285F4',
    specs: [
      { id: 'pmax-landscape', name: 'Landscape Image', width: 1200, height: 628, platform: 'PMax', placement: 'Google PMax' },
      { id: 'pmax-square', name: 'Square Image', width: 1200, height: 1200, platform: 'PMax', placement: 'Google PMax' },
      { id: 'pmax-portrait', name: 'Portrait Image', width: 900, height: 1600, platform: 'PMax', placement: 'Google PMax' },
      { id: 'pmax-logo-square', name: 'Logo Square', width: 1200, height: 1200, platform: 'PMax', placement: 'Google PMax Logo' },
      { id: 'pmax-logo-landscape', name: 'Logo Landscape', width: 1200, height: 300, platform: 'PMax', placement: 'Google PMax Logo' },
    ]
  },
  {
    id: 'display-core',
    label: 'Display Core',
    platform: 'Google Display Network — IAB Core',
    color: '#34A853',
    specs: [
      { id: 'iab-mrec', name: 'Medium Rectangle', width: 300, height: 250, platform: 'GDN', placement: 'Desktop/Mobile' },
      { id: 'iab-large-rect', name: 'Large Rectangle', width: 336, height: 280, platform: 'GDN', placement: 'Desktop' },
      { id: 'iab-leaderboard', name: 'Leaderboard', width: 728, height: 90, platform: 'GDN', placement: 'Desktop' },
      { id: 'iab-large-leader', name: 'Large Leaderboard', width: 970, height: 90, platform: 'GDN', placement: 'Desktop' },
      { id: 'iab-billboard', name: 'Billboard', width: 970, height: 250, platform: 'GDN', placement: 'Desktop' },
      { id: 'iab-halfpage', name: 'Half Page', width: 300, height: 600, platform: 'GDN', placement: 'Desktop' },
      { id: 'iab-wide-sky', name: 'Wide Skyscraper', width: 160, height: 600, platform: 'GDN', placement: 'Desktop' },
      { id: 'iab-skyscraper', name: 'Skyscraper', width: 120, height: 600, platform: 'GDN', placement: 'Desktop' },
      { id: 'iab-mobile-banner', name: 'Mobile Banner', width: 320, height: 50, platform: 'GDN', placement: 'Mobile' },
      { id: 'iab-large-mobile', name: 'Large Mobile Banner', width: 320, height: 100, platform: 'GDN', placement: 'Mobile' },
      { id: 'iab-full-banner', name: 'Full Banner', width: 468, height: 60, platform: 'GDN', placement: 'Desktop' },
      { id: 'iab-half-banner', name: 'Half Banner', width: 234, height: 60, platform: 'GDN', placement: 'Desktop' },
      { id: 'iab-square', name: 'Square', width: 250, height: 250, platform: 'GDN', placement: 'Desktop' },
      { id: 'iab-small-square', name: 'Small Square', width: 200, height: 200, platform: 'GDN', placement: 'Desktop' },
      { id: 'iab-vertical-banner', name: 'Vertical Banner', width: 120, height: 240, platform: 'GDN', placement: 'Desktop' },
      { id: 'iab-button', name: 'Button', width: 125, height: 125, platform: 'GDN', placement: 'Desktop' },
    ]
  },
  {
    id: 'display-extended',
    label: 'Display Extended',
    platform: 'Google Display Network — Extended',
    color: '#FBBC04',
    specs: [
      { id: 'gdn-panorama', name: 'Panorama', width: 980, height: 120, platform: 'GDN', placement: 'Desktop' },
      { id: 'gdn-top-banner', name: 'Top Banner', width: 930, height: 180, platform: 'GDN', placement: 'Desktop' },
      { id: 'gdn-wide-banner', name: 'Wide Banner', width: 950, height: 90, platform: 'GDN', placement: 'Desktop' },
      { id: 'gdn-portrait', name: 'Portrait', width: 300, height: 1050, platform: 'GDN', placement: 'Desktop' },
      { id: 'gdn-netboard', name: 'Netboard', width: 580, height: 400, platform: 'GDN', placement: 'Desktop' },
    ]
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    platform: 'LinkedIn',
    color: '#0A66C2',
    specs: [
      { id: 'li-landscape', name: 'Sponsored Content Landscape', width: 1200, height: 627, platform: 'LinkedIn', placement: 'Feed' },
      { id: 'li-square', name: 'Sponsored Content Square', width: 1200, height: 1200, platform: 'LinkedIn', placement: 'Feed' },
      { id: 'li-vertical', name: 'Sponsored Content Vertical', width: 628, height: 1200, platform: 'LinkedIn', placement: 'Feed' },
      { id: 'li-carousel', name: 'Carousel Card', width: 1080, height: 1080, platform: 'LinkedIn', placement: 'Carousel' },
      { id: 'li-story', name: 'Story', width: 1080, height: 1920, platform: 'LinkedIn', placement: 'Stories' },
      { id: 'li-message-ad', name: 'Message Ad Banner', width: 300, height: 250, platform: 'LinkedIn', placement: 'InMail' },
      { id: 'li-text-ad', name: 'Text Ad Image', width: 100, height: 100, platform: 'LinkedIn', placement: 'Sidebar' },
    ]
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    platform: 'TikTok',
    color: '#010101',
    specs: [
      { id: 'tt-infeed-vertical', name: 'In-Feed Vertical', width: 1080, height: 1920, platform: 'TikTok', placement: 'Feed' },
      { id: 'tt-infeed-square', name: 'In-Feed Square', width: 1080, height: 1080, platform: 'TikTok', placement: 'Feed' },
      { id: 'tt-infeed-landscape', name: 'In-Feed Landscape', width: 1920, height: 1080, platform: 'TikTok', placement: 'Feed' },
      { id: 'tt-topview', name: 'TopView', width: 1080, height: 1920, platform: 'TikTok', placement: 'Launch' },
      { id: 'tt-brand-takeover', name: 'Brand Takeover', width: 1080, height: 1920, platform: 'TikTok', placement: 'Launch' },
    ]
  },
  {
    id: 'snapchat',
    label: 'Snapchat',
    platform: 'Snapchat',
    color: '#FFFC00',
    specs: [
      { id: 'snap-single', name: 'Single Image Ad', width: 1080, height: 1920, platform: 'Snapchat', placement: 'Stories' },
      { id: 'snap-collection', name: 'Collection Ad', width: 1080, height: 1920, platform: 'Snapchat', placement: 'Stories' },
      { id: 'snap-filter', name: 'Filter', width: 1080, height: 2340, platform: 'Snapchat', placement: 'Overlay' },
    ]
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    platform: 'Pinterest',
    color: '#E60023',
    specs: [
      { id: 'pin-standard', name: 'Standard Pin', width: 1000, height: 1500, platform: 'Pinterest', placement: 'Feed' },
      { id: 'pin-square', name: 'Square Pin', width: 1000, height: 1000, platform: 'Pinterest', placement: 'Feed' },
      { id: 'pin-idea', name: 'Idea Pin', width: 1080, height: 1920, platform: 'Pinterest', placement: 'Stories' },
      { id: 'pin-shopping', name: 'Shopping Ad', width: 1000, height: 1500, platform: 'Pinterest', placement: 'Shopping' },
      { id: 'pin-collections', name: 'Collections Hero', width: 1500, height: 1000, platform: 'Pinterest', placement: 'Collections' },
    ]
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    platform: 'X (Twitter)',
    color: '#000000',
    specs: [
      { id: 'tw-landscape', name: 'Single Image Landscape', width: 1600, height: 900, platform: 'X', placement: 'Feed' },
      { id: 'tw-square', name: 'Single Image Square', width: 1200, height: 1200, platform: 'X', placement: 'Feed' },
      { id: 'tw-website-card', name: 'Website Card', width: 800, height: 418, platform: 'X', placement: 'Feed' },
      { id: 'tw-app-card', name: 'App Card', width: 800, height: 800, platform: 'X', placement: 'Feed' },
    ]
  },
  {
    id: 'youtube',
    label: 'YouTube',
    platform: 'YouTube',
    color: '#FF0000',
    specs: [
      { id: 'yt-thumbnail', name: 'Thumbnail', width: 1280, height: 720, platform: 'YouTube', placement: 'Search/Suggested' },
      { id: 'yt-display', name: 'Display Ad', width: 300, height: 250, platform: 'YouTube', placement: 'Sidebar' },
      { id: 'yt-overlay', name: 'Overlay Ad', width: 480, height: 70, platform: 'YouTube', placement: 'Video Overlay' },
      { id: 'yt-masthead', name: 'Masthead', width: 1920, height: 1080, platform: 'YouTube', placement: 'Homepage' },
    ]
  },
  {
    id: 'programmatic',
    label: 'Programmatic',
    platform: 'Programmatic / DV360 / Trade Desk',
    color: '#6B46C1',
    specs: [
      { id: 'prog-tablet-inter', name: 'Tablet Interstitial', width: 768, height: 1024, platform: 'Programmatic', placement: 'Tablet' },
      { id: 'prog-mobile-portrait', name: 'Mobile Interstitial Portrait', width: 320, height: 480, platform: 'Programmatic', placement: 'Mobile' },
      { id: 'prog-mobile-landscape', name: 'Mobile Interstitial Landscape', width: 480, height: 320, platform: 'Programmatic', placement: 'Mobile' },
      { id: 'prog-pushdown', name: 'Pushdown', width: 970, height: 415, platform: 'Programmatic', placement: 'Desktop' },
      { id: 'prog-halfpage-tablet', name: 'Half-Page Tablet', width: 600, height: 500, platform: 'Programmatic', placement: 'Tablet' },
      { id: 'prog-filmstrip', name: 'Filmstrip', width: 300, height: 600, platform: 'Programmatic', placement: 'Desktop' },
      { id: 'prog-native', name: 'Native', width: 600, height: 315, platform: 'Programmatic', placement: 'Native' },
    ]
  },
  {
    id: 'email',
    label: 'Email',
    platform: 'Email Marketing',
    color: '#059669',
    specs: [
      { id: 'email-header', name: 'Email Header', width: 600, height: 200, platform: 'Email', placement: 'Top of email' },
      { id: 'email-banner', name: 'Email Banner', width: 600, height: 150, platform: 'Email', placement: 'Mid-email' },
      { id: 'email-square', name: 'Email Square', width: 600, height: 600, platform: 'Email', placement: 'Product feature' },
      { id: 'email-footer', name: 'Email Footer', width: 600, height: 100, platform: 'Email', placement: 'Signature area' },
    ]
  },
  {
    id: 'ooh',
    label: 'OOH Digital',
    platform: 'Out-of-Home Digital',
    color: '#DC2626',
    specs: [
      { id: 'ooh-street-portrait', name: 'Street Furniture Portrait', width: 1080, height: 1920, platform: 'OOH', placement: 'Bus shelters' },
      { id: 'ooh-billboard', name: 'Billboard Landscape', width: 1920, height: 1080, platform: 'OOH', placement: 'Roadside' },
      { id: 'ooh-retail', name: 'Retail Screen', width: 1080, height: 1920, platform: 'OOH', placement: 'In-store' },
      { id: 'ooh-transit', name: 'Transit Portrait', width: 1080, height: 1350, platform: 'OOH', placement: 'Train/Bus' },
    ]
  },
]

export const getAllSpecs = (): AdSpec[] => SPEC_SETS.flatMap(s => s.specs)

export const getSpecById = (id: string): AdSpec | undefined =>
  getAllSpecs().find(s => s.id === id)

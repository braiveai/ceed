'use client'

import { useState } from 'react'
import { AdSpec } from '@/lib/specs'

interface InSituPreviewProps {
  specs: AdSpec[]
  dataUrls: Record<string, string>
  platformId: string
  onClose: () => void
}

function AdSlot({ spec, dataUrl }: { spec: AdSpec; dataUrl: string }) {
  const aspect = spec.width / spec.height
  const dispW = Math.min(spec.width, 480)
  const dispH = Math.round(dispW / aspect)
  return (
    <div style={{ border: '1px solid rgba(128,128,128,0.25)', overflow: 'hidden', display: 'inline-block', backgroundColor: '#222' }}>
      {dataUrl
        ? <img src={dataUrl} alt="ad" style={{ display: 'block', width: dispW, height: dispH }} />
        : <div style={{ width: dispW, height: dispH, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 12 }}>{spec.width}×{spec.height} · Export to preview</div>}
    </div>
  )
}

function MetaFeedMock({ spec, dataUrl, dark }: { spec: AdSpec; dataUrl: string; dark: boolean }) {
  const bg = dark ? '#18191A' : '#F0F2F5'
  const card = dark ? '#242526' : '#fff'
  const text = dark ? '#E4E6EB' : '#050505'
  const sub = dark ? '#B0B3B8' : '#65676B'
  const divider = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const aspect = spec.width / spec.height
  const w = Math.min(spec.width, 500)
  const h = Math.round(w / aspect)
  return (
    <div style={{ backgroundColor: bg, minHeight: '100%', display: 'flex', justifyContent: 'center', padding: '20px 12px', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif' }}>
      <div style={{ width: Math.max(w, 400), maxWidth: 500 }}>
        <div style={{ backgroundColor: card, borderRadius: 8, border: `1px solid ${divider}`, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: text }}>Your Brand Page</div>
              <div style={{ fontSize: 12, color: sub, display: 'flex', alignItems: 'center', gap: 4 }}>Sponsored · <span>🌐</span></div>
            </div>
            <div style={{ color: sub, fontSize: 22, lineHeight: 1 }}>···</div>
          </div>
          <div style={{ fontSize: 14, color: text, padding: '0 16px 10px', lineHeight: 1.5 }}>See what we&apos;ve been working on — built for results.</div>
          <div style={{ height: h, overflow: 'hidden', backgroundColor: '#111' }}>
            {dataUrl ? <img src={dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 13 }}>{spec.width}×{spec.height}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `1px solid ${divider}` }}>
            <div><div style={{ fontSize: 13, fontWeight: 600, color: text }}>Your headline here</div><div style={{ fontSize: 12, color: sub }}>yourbrand.com.au</div></div>
            <div style={{ backgroundColor: dark ? '#3A3B3C' : '#E4E6EB', padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, color: text, whiteSpace: 'nowrap', flexShrink: 0 }}>Learn More</div>
          </div>
          <div style={{ display: 'flex' }}>
            {['👍 Like', '💬 Comment', '↗ Share'].map(a => (
              <div key={a} style={{ flex: 1, padding: '8px 0', textAlign: 'center', fontSize: 13, fontWeight: 600, color: sub }}>{a}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaStoriesMock({ spec, dataUrl }: { spec: AdSpec; dataUrl: string }) {
  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', padding: 20 }}>
      <div style={{ width: 280, height: 497, borderRadius: 20, overflow: 'hidden', position: 'relative', backgroundColor: '#111', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
        {dataUrl ? <img src={dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 12 }}>{spec.width}×{spec.height}</div>}
        <div style={{ position: 'absolute', top: 10, left: 8, right: 8, display: 'flex', gap: 3 }}>
          {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: 2.5, borderRadius: 2, backgroundColor: i === 1 ? '#fff' : 'rgba(255,255,255,0.35)' }} />)}
        </div>
        <div style={{ position: 'absolute', top: 20, left: 12, right: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#ef4444)', border: '2px solid #fff' }} />
          <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>Your Brand · <span style={{ fontWeight: 400 }}>Sponsored</span></div>
          <div style={{ marginLeft: 'auto', color: '#fff', fontSize: 18 }}>✕</div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', padding: '40px 16px 24px', textAlign: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11, marginBottom: 6 }}>↑  Swipe up</div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: '#fff', padding: '8px 24px', borderRadius: 20, fontSize: 13, fontWeight: 600, display: 'inline-block' }}>Learn More</div>
        </div>
      </div>
    </div>
  )
}

function LinkedInMock({ spec, dataUrl, dark }: { spec: AdSpec; dataUrl: string; dark: boolean }) {
  const bg = dark ? '#1B1F23' : '#F3F2EF'
  const card = dark ? '#1D2226' : '#fff'
  const text = dark ? '#E7E7E7' : '#000'
  const sub = dark ? '#A8A8A8' : '#666'
  const divider = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'
  const w = Math.min(spec.width, 500)
  const h = Math.round(w / (spec.width / spec.height))
  return (
    <div style={{ backgroundColor: bg, minHeight: '100%', display: 'flex', justifyContent: 'center', padding: '20px 12px', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <div style={{ width: Math.max(w, 400), maxWidth: 500 }}>
        <div style={{ backgroundColor: card, borderRadius: 8, border: `1px solid ${divider}`, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 4, backgroundColor: '#0A66C2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 }}>B</div>
            <div><div style={{ fontSize: 14, fontWeight: 600, color: text }}>Your Company</div><div style={{ fontSize: 12, color: sub }}>Promoted</div></div>
          </div>
          <div style={{ padding: '0 16px 10px', fontSize: 14, color: text, lineHeight: 1.5 }}>Helping businesses grow smarter with AI automation. See how →</div>
          <div style={{ height: h, backgroundColor: '#111', overflow: 'hidden' }}>
            {dataUrl ? <img src={dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 13 }}>{spec.width}×{spec.height}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: text }}>Your headline</div><div style={{ fontSize: 12, color: sub }}>yourbrand.com</div></div>
            <div style={{ backgroundColor: '#0A66C2', color: '#fff', padding: '6px 18px', borderRadius: 16, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>Learn more</div>
          </div>
          <div style={{ display: 'flex', padding: '2px 8px' }}>
            {['👍 Like','💬 Comment','🔄 Repost','✉️ Send'].map(a => (
              <div key={a} style={{ flex: 1, padding: '8px 2px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: sub }}>{a}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TikTokMock({ spec, dataUrl }: { spec: AdSpec; dataUrl: string }) {
  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', padding: 20 }}>
      <div style={{ width: 270, height: 480, borderRadius: 16, overflow: 'hidden', position: 'relative', backgroundColor: '#111', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
        {dataUrl ? <img src={dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 12 }}>{spec.width}×{spec.height}</div>}
        {/* Right sidebar icons */}
        <div style={{ position: 'absolute', right: 10, bottom: 80, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #fff', background: 'linear-gradient(135deg,#f97316,#ef4444)', overflow: 'hidden' }} />
          {['❤️','💬','🔖','↗️'].map((ic, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24 }}>{ic}</div>
              <div style={{ color: '#fff', fontSize: 10, marginTop: 2 }}>{['12.4K','843','2.1K','Share'][i]}</div>
            </div>
          ))}
        </div>
        {/* Bottom bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '30px 12px 12px' }}>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>@yourbrand · Sponsored</div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 8 }}>Check this out 🔥 #ad</div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '6px 16px', borderRadius: 4, fontSize: 12, fontWeight: 600, display: 'inline-block' }}>Learn More ›</div>
        </div>
      </div>
    </div>
  )
}

function YouTubeMock({ spec, dataUrl, dark }: { spec: AdSpec; dataUrl: string; dark: boolean }) {
  const bg = dark ? '#0F0F0F' : '#F9F9F9'
  const text = dark ? '#F1F1F1' : '#0F0F0F'
  const sub = dark ? '#AAAAAA' : '#606060'
  const w = Math.min(spec.width, 480)
  const h = Math.round(w / (spec.width / spec.height))
  return (
    <div style={{ backgroundColor: bg, minHeight: '100%', padding: '20px 16px', fontFamily: '"Roboto",sans-serif' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          {/* Main video */}
          <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 48, opacity: 0.3 }}>▶</div>
            </div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: text, marginBottom: 6 }}>Video Title — How AI is changing everything in 2026</div>
          <div style={{ fontSize: 13, color: sub }}>ChannelName · 1.2M views · 3 days ago</div>
        </div>
        {/* Sidebar ad */}
        <div style={{ width: Math.max(w, 300), flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: sub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Ad</div>
          <div style={{ overflow: 'hidden', borderRadius: 4, marginBottom: 6 }}>
            {dataUrl ? <img src={dataUrl} alt="" style={{ display: 'block', width: '100%' }} />
              : <div style={{ width: '100%', height: h, backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 12 }}>{spec.width}×{spec.height}</div>}
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: text }}>Your headline here</div>
          <div style={{ fontSize: 12, color: sub }}>Ads · yourbrand.com.au</div>
        </div>
      </div>
    </div>
  )
}

function EmailMock({ spec, dataUrl, dark }: { spec: AdSpec; dataUrl: string; dark: boolean }) {
  const bg = dark ? '#1a1a1a' : '#f4f4f4'
  const emailBg = dark ? '#2a2a2a' : '#ffffff'
  const text = dark ? '#e0e0e0' : '#333'
  const sub = dark ? '#999' : '#666'
  const w = Math.min(spec.width, 600)
  const h = Math.round(w / (spec.width / spec.height))
  return (
    <div style={{ backgroundColor: bg, minHeight: '100%', display: 'flex', justifyContent: 'center', padding: '20px 12px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ width: 620 }}>
        {/* Email chrome */}
        <div style={{ backgroundColor: dark ? '#333' : '#e8e8e8', borderRadius: '8px 8px 0 0', padding: '8px 12px', display: 'flex', gap: 6 }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: c }} />)}
          <div style={{ flex: 1, backgroundColor: dark ? '#444' : '#fff', borderRadius: 4, margin: '0 8px', height: 20, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
            <span style={{ fontSize: 11, color: sub }}>Newsletter from Your Brand &lt;hello@yourbrand.com&gt;</span>
          </div>
        </div>
        <div style={{ backgroundColor: emailBg, padding: '0 0 24px', border: `1px solid ${dark ? '#444' : '#ddd'}` }}>
          {/* Header area */}
          <div style={{ backgroundColor: dark ? '#333' : '#f8f8f8', padding: '16px 24px', borderBottom: `1px solid ${dark ? '#444' : '#eee'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: text }}>Your Brand</div>
            <div style={{ fontSize: 11, color: sub }}>View in browser</div>
          </div>
          <div style={{ padding: '24px 24px 0' }}>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: text, marginTop: 0 }}>Hi there,</p>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: text }}>We&apos;ve got something exciting to share with you this week. Check out what we&apos;ve been working on:</p>
          </div>
          {/* Ad image */}
          <div style={{ padding: '16px 24px' }}>
            <div style={{ overflow: 'hidden', borderRadius: 4 }}>
              {dataUrl ? <img src={dataUrl} alt="" style={{ display: 'block', width: '100%' }} />
                : <div style={{ width: w, height: h, backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 12 }}>{spec.width}×{spec.height}</div>}
            </div>
          </div>
          <div style={{ padding: '0 24px' }}>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: text }}>Hope to see you soon!</p>
            <p style={{ fontSize: 13, color: sub }}>The Your Brand Team</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function OOHMock({ spec, dataUrl }: { spec: AdSpec; dataUrl: string }) {
  const isBillboard = spec.width > spec.height
  const w = Math.min(spec.width, isBillboard ? 480 : 280)
  const h = Math.round(w / (spec.width / spec.height))
  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2a3a2a', padding: 32 }}>
      <div style={{ position: 'relative' }}>
        {isBillboard ? (
          // Billboard
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', background: '#8B7355', padding: '8px 8px 0', borderRadius: '4px 4px 0 0', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              <div style={{ overflow: 'hidden', borderRadius: 2 }}>
                {dataUrl ? <img src={dataUrl} alt="" style={{ display: 'block', width: w, height: h }} />
                  : <div style={{ width: w, height: h, backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 12 }}>{spec.width}×{spec.height}</div>}
              </div>
            </div>
            <div style={{ width: 8, height: 60, backgroundColor: '#5a4a3a', margin: '0 auto' }} />
          </div>
        ) : (
          // Bus shelter / street furniture
          <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: 20, borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
            <div style={{ backgroundColor: '#111', padding: 6, borderRadius: 4, display: 'inline-block' }}>
              {dataUrl ? <img src={dataUrl} alt="" style={{ display: 'block', width: w, height: h }} />
                : <div style={{ width: w, height: h, backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 12 }}>{spec.width}×{spec.height}</div>}
            </div>
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 12, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{spec.name} · {spec.width}×{spec.height}</div>
      </div>
    </div>
  )
}

function BrowserChrome({ dark, children }: { dark: boolean; children: React.ReactNode }) {
  const chrome = dark ? '#2a2a2e' : '#e8e8e8'
  const bar = dark ? '#1a1a1e' : '#f5f5f5'
  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.4)', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'}` }}>
      {/* Chrome bar */}
      <div style={{ backgroundColor: chrome, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c }} />)}
        </div>
        <div style={{ flex: 1, backgroundColor: bar, borderRadius: 4, padding: '3px 10px', fontSize: 11, color: dark ? '#888' : '#666', fontFamily: 'system-ui' }}>
          news.com.au/technology
        </div>
      </div>
      {/* Page */}
      <div style={{ backgroundColor: dark ? '#f5f5f5' : '#f0f0f0', maxHeight: 560, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

function AdBox({ spec, dataUrl, w, h }: { spec: AdSpec; dataUrl: string; w: number; h: number }) {
  return (
    <div style={{ width: w, height: h, flexShrink: 0, position: 'relative', overflow: 'hidden', backgroundColor: '#e0e0e0', border: '1px solid rgba(0,0,0,0.12)' }}>
      {dataUrl
        ? <img src={dataUrl} alt="ad" style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }} />
        : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>Ad</div>
            <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>{spec.width}×{spec.height}</div>
          </div>}
      <div style={{ position: 'absolute', top: 2, left: 2, fontSize: 8, color: 'rgba(0,0,0,0.4)', backgroundColor: 'rgba(255,255,255,0.7)', padding: '1px 3px', borderRadius: 2, fontFamily: 'system-ui' }}>Ad</div>
    </div>
  )
}

// Shared content blocks
function ContentBlocks({ lines = 4, dark = false }: { lines?: number; dark?: boolean }) {
  const c = dark ? '#ccc' : '#d8d8d8'
  const c2 = dark ? '#bbb' : '#c8c8c8'
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ height: 11, backgroundColor: c, borderRadius: 2, marginBottom: 5, width: `${75 + (i % 3) * 8}%` }} />
          <div style={{ height: 11, backgroundColor: c, borderRadius: 2, marginBottom: 5, width: `${85 + (i % 2) * 10}%` }} />
          <div style={{ height: 11, backgroundColor: c2, borderRadius: 2, width: `${55 + (i % 4) * 8}%` }} />
        </div>
      ))}
    </div>
  )
}

function NavBar({ dark }: { dark: boolean }) {
  const bg = dark ? '#1e1e22' : '#ffffff'
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const c = dark ? '#ccc' : '#444'
  const c2 = dark ? '#888' : '#888'
  return (
    <div style={{ backgroundColor: bg, borderBottom: `1px solid ${border}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 60, height: 14, backgroundColor: dark ? '#555' : '#c0c0c0', borderRadius: 2 }} />
      {['Home','News','Tech','Sport','Life'].map(l => (
        <div key={l} style={{ fontSize: 11, color: l === 'Tech' ? '#5B6AF0' : c2, fontFamily: 'system-ui', fontWeight: l === 'Tech' ? 600 : 400 }}>{l}</div>
      ))}
    </div>
  )
}

function PageHeadline({ dark }: { dark: boolean }) {
  const text = dark ? '#1a1a1a' : '#1a1a1a'
  const sub = dark ? '#555' : '#555'
  return (
    <div style={{ padding: '14px 16px 10px' }}>
      <div style={{ fontSize: 9, color: '#5B6AF0', fontFamily: 'system-ui', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>Technology</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: text, lineHeight: 1.3, marginBottom: 6, fontFamily: 'Georgia, serif' }}>AI Automation Reshapes How Agencies Work in 2026</div>
      <div style={{ fontSize: 11, color: sub, fontFamily: 'system-ui' }}>By Staff Reporter · 2 hours ago</div>
    </div>
  )
}

function DisplayMock({ spec, dataUrl, dark }: { spec: AdSpec; dataUrl: string; dark: boolean }) {
  const { width, height } = spec
  const aspect = width / height

  // Categorise the format
  const isLeaderboard = height <= 100 && width >= 468       // 728×90, 970×90, 468×60 etc
  const isBillboard = height > 100 && height <= 300 && width >= 700  // 970×250, 980×120
  const isMrec = width <= 336 && height <= 280 && height >= 200      // 300×250, 336×280
  const isHalfPage = width <= 340 && height >= 500           // 300×600
  const isSkyscraper = width <= 170 && height >= 400         // 160×600, 120×600
  const isWideRect = width <= 340 && height < 200 && height >= 80    // smaller boxes
  const isMobileBanner = width <= 330 && height <= 110       // 320×50, 320×100

  // Scale ad to fit in page mock sensibly
  const PAGE_W = 660  // inner page width in preview
  const maxAdW = isLeaderboard || isBillboard ? PAGE_W - 32 : isSkyscraper ? 80 : isMrec || isHalfPage ? 200 : Math.min(width, 200)
  const adW = maxAdW
  const adH = Math.round(adW / aspect)

  // Mobile banner: show in a phone frame
  if (isMobileBanner) {
    return (
      <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: dark ? '#1a1a1a' : '#e8e8e8' }}>
        <div style={{ width: 280, height: 560, backgroundColor: '#fff', borderRadius: 24, boxShadow: '0 16px 48px rgba(0,0,0,0.4)', overflow: 'hidden', position: 'relative', border: '6px solid #222' }}>
          <NavBar dark={false} />
          <div style={{ padding: '12px 12px 0' }}>
            <PageHeadline dark={false} />
            <div style={{ padding: '0 0 8px' }}><ContentBlocks lines={5} /></div>
          </div>
          {/* Sticky banner at bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
              <AdBox spec={spec} dataUrl={dataUrl} w={Math.min(adW, 260)} h={Math.min(adH, 90)} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // All desktop formats in browser chrome
  const bg = '#f5f5f5'

  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 20px', backgroundColor: dark ? '#1a1a1a' : '#e0e0e0' }}>
      <div style={{ width: Math.min(PAGE_W + 40, '100%' as any) }}>
        <BrowserChrome dark={dark}>
          {/* Nav */}
          <NavBar dark={false} />

          {/* Leaderboard — top of page */}
          {isLeaderboard && (
            <div style={{ padding: '10px 16px', textAlign: 'center', backgroundColor: bg }}>
              <div style={{ fontSize: 8, color: '#aaa', marginBottom: 3, fontFamily: 'system-ui', textTransform: 'uppercase', letterSpacing: 0.5 }}>Advertisement</div>
              <AdBox spec={spec} dataUrl={dataUrl} w={adW} h={adH} />
            </div>
          )}

          {/* Billboard — between content sections */}
          {isBillboard && (
            <>
              <div style={{ backgroundColor: bg }}>
                <PageHeadline dark={false} />
                <div style={{ padding: '0 16px 12px', display: 'flex', gap: 12 }}><ContentBlocks lines={2} /></div>
              </div>
              <div style={{ padding: '10px 16px', textAlign: 'center', backgroundColor: '#ebebeb', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 8, color: '#aaa', marginBottom: 3, fontFamily: 'system-ui', textTransform: 'uppercase', letterSpacing: 0.5 }}>Advertisement</div>
                <AdBox spec={spec} dataUrl={dataUrl} w={adW} h={adH} />
              </div>
              <div style={{ padding: '12px 16px', backgroundColor: bg, display: 'flex', gap: 12 }}><ContentBlocks lines={2} /></div>
            </>
          )}

          {/* MREC / Half Page / Skyscraper — in sidebar */}
          {(isMrec || isHalfPage || isSkyscraper || isWideRect) && (
            <div style={{ backgroundColor: bg }}>
              <PageHeadline dark={false} />
              {isLeaderboard ? null : null}
              <div style={{ padding: '0 16px 16px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {/* Article content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <ContentBlocks lines={isHalfPage ? 8 : 5} />
                </div>
                {/* Sidebar ad */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{ fontSize: 8, color: '#aaa', marginBottom: 3, fontFamily: 'system-ui', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Ad</div>
                  <AdBox spec={spec} dataUrl={dataUrl} w={adW} h={adH} />
                  {!isHalfPage && (
                    <div style={{ marginTop: 12 }}>
                      <ContentBlocks lines={2} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </BrowserChrome>

        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: dark ? '#555' : '#888', fontFamily: 'system-ui' }}>
          {spec.name} · {spec.width}×{spec.height} · {spec.placement}
        </div>
      </div>
    </div>
  )
}

export default function InSituPreview({ specs, dataUrls, platformId, onClose }: InSituPreviewProps) {
  const [specIndex, setSpecIndex] = useState(0)
  const [dark, setDark] = useState(true)
  const spec = specs[specIndex]
  const dataUrl = spec ? (dataUrls[spec.id] || '') : ''

  const getMock = () => {
    if (!spec) return null
    const isStory = spec.height / spec.width > 1.5
    const isDisplay = ['iab-','gdn-','prog-','yt-display','yt-overlay'].some(p => spec.id.startsWith(p)) || platformId === 'display-core' || platformId === 'display-extended' || platformId === 'programmatic'
    if (platformId === 'meta' && isStory) return <MetaStoriesMock spec={spec} dataUrl={dataUrl} />
    if (platformId === 'meta') return <MetaFeedMock spec={spec} dataUrl={dataUrl} dark={dark} />
    if (platformId === 'linkedin') return <LinkedInMock spec={spec} dataUrl={dataUrl} dark={dark} />
    if (platformId === 'tiktok') return <TikTokMock spec={spec} dataUrl={dataUrl} />
    if (platformId === 'youtube') return <YouTubeMock spec={spec} dataUrl={dataUrl} dark={dark} />
    if (platformId === 'email') return <EmailMock spec={spec} dataUrl={dataUrl} dark={dark} />
    if (platformId === 'ooh') return <OOHMock spec={spec} dataUrl={dataUrl} />
    if (isDisplay) return <DisplayMock spec={spec} dataUrl={dataUrl} dark={dark} />
    return <DisplayMock spec={spec} dataUrl={dataUrl} dark={dark} />
  }

  if (!spec) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white">In-situ Preview</span>
          <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1">
            <button onClick={() => setDark(true)} className={`px-3 py-1 rounded-md text-xs font-medium transition ${dark ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Dark</button>
            <button onClick={() => setDark(false)} className={`px-3 py-1 rounded-md text-xs font-medium transition ${!dark ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Light</button>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto max-w-2xl">
          <button onClick={() => setSpecIndex(i => Math.max(0, i - 1))} disabled={specIndex === 0}
            className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center justify-center flex-shrink-0">‹</button>
          <div className="flex gap-1 flex-wrap justify-center">
            {specs.map((s, i) => (
              <button key={s.id} onClick={() => setSpecIndex(i)}
                className={`px-2 py-1 rounded text-xs transition flex-shrink-0 ${i === specIndex ? 'bg-white/15 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {s.width}×{s.height}
              </button>
            ))}
          </div>
          <button onClick={() => setSpecIndex(i => Math.min(specs.length - 1, i + 1))} disabled={specIndex === specs.length - 1}
            className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center justify-center flex-shrink-0">›</button>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 transition flex-shrink-0">✕ Close</button>
      </div>
      <div className="text-center py-1.5 text-xs text-zinc-700 flex-shrink-0">
        {spec.name} · {spec.width}×{spec.height} · {spec.placement}
        {!dataUrl && <span className="ml-2 text-orange-400/70">· Generate ads first to preview</span>}
      </div>
      <div className="flex-1 overflow-auto">{getMock()}</div>
    </div>
  )
}

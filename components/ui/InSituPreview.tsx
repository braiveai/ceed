'use client'

import { useState } from 'react'
import { AdSpec } from '@/lib/specs'

interface InSituPreviewProps {
  specs: AdSpec[]
  dataUrls: Record<string, string>
  platformId: string
  onClose: () => void
}

function Avatar({ size = 32, seed = 1 }: { size?: number; seed?: number }) {
  const colors = ['#3B82F6','#8B5CF6','#EC4899','#F97316','#10B981']
  const c = colors[seed % colors.length]
  return <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: c, flexShrink: 0 }} />
}

function MetaFeedMock({ spec, dataUrl, dark }: { spec: AdSpec; dataUrl: string; dark: boolean }) {
  const bg = dark ? '#1C1E21' : '#F0F2F5'
  const cardBg = dark ? '#242526' : '#FFFFFF'
  const text = dark ? '#E4E6EB' : '#1C1E21'
  const sub = dark ? '#B0B3B8' : '#65676B'
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const aspect = spec.width / spec.height
  const imgW = Math.min(spec.width, 500)
  const imgH = Math.round(imgW / aspect)

  return (
    <div style={{ backgroundColor: bg, minHeight: '100%', display: 'flex', justifyContent: 'center', padding: '20px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: Math.max(imgW, 400), maxWidth: 500 }}>
        <div style={{ backgroundColor: cardBg, borderRadius: 8, border: `1px solid ${border}`, overflow: 'hidden' }}>
          {/* Post header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
            <Avatar size={40} seed={2} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: text }}>Sponsored Company</div>
              <div style={{ fontSize: 12, color: sub, marginTop: 2 }}>Sponsored · <span style={{ fontSize: 12 }}>🌐</span></div>
            </div>
            <div style={{ color: sub, fontSize: 20 }}>···</div>
          </div>
          {/* Ad copy */}
          <div style={{ padding: '0 16px 10px', fontSize: 14, color: text, lineHeight: 1.4 }}>
            Check out our latest offer — designed for you.
          </div>
          {/* Ad image */}
          <div style={{ width: '100%', height: imgH, overflow: 'hidden', position: 'relative', backgroundColor: '#000' }}>
            {dataUrl
              ? <img src={dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 13 }}>{spec.width}×{spec.height}</div>}
          </div>
          {/* CTA strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `1px solid ${border}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: text }}>Your headline here</div>
              <div style={{ fontSize: 12, color: sub }}>sponsoredcompany.com.au</div>
            </div>
            <div style={{ backgroundColor: dark ? '#3A3B3C' : '#E4E6EB', padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, color: text, whiteSpace: 'nowrap' }}>Learn More</div>
          </div>
          {/* Engagement bar */}
          <div style={{ display: 'flex', padding: '4px 16px' }}>
            {['👍 Like', '💬 Comment', '↗ Share'].map(a => (
              <div key={a} style={{ flex: 1, padding: '8px 0', textAlign: 'center', fontSize: 13, fontWeight: 600, color: sub, cursor: 'pointer' }}>{a}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaStoriesMock({ spec, dataUrl, dark }: { spec: AdSpec; dataUrl: string; dark: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', backgroundColor: '#000', padding: 20 }}>
      <div style={{ width: 280, height: 497, borderRadius: 16, overflow: 'hidden', position: 'relative', backgroundColor: '#111' }}>
        {dataUrl
          ? <img src={dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 13 }}>{spec.width}×{spec.height}</div>}
        {/* Progress bars */}
        <div style={{ position: 'absolute', top: 10, left: 8, right: 8, display: 'flex', gap: 3 }}>
          {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: 2, borderRadius: 2, backgroundColor: i === 1 ? '#fff' : 'rgba(255,255,255,0.4)' }} />)}
        </div>
        {/* Header */}
        <div style={{ position: 'absolute', top: 20, left: 12, right: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size={28} seed={3} />
          <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Sponsored</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, color: '#fff', fontSize: 18 }}>✕</div>
        </div>
        {/* Swipe up */}
        <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ color: '#fff', fontSize: 11, marginBottom: 4, opacity: 0.8 }}>↑</div>
          <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>Learn More</div>
        </div>
      </div>
    </div>
  )
}

function LinkedInMock({ spec, dataUrl, dark }: { spec: AdSpec; dataUrl: string; dark: boolean }) {
  const bg = dark ? '#1B1F23' : '#F3F2EF'
  const cardBg = dark ? '#1D2226' : '#FFFFFF'
  const text = dark ? '#E7E7E7' : '#000000'
  const sub = dark ? '#A8A8A8' : '#666666'
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'
  const aspect = spec.width / spec.height
  const imgW = Math.min(spec.width, 500)
  const imgH = Math.round(imgW / aspect)

  return (
    <div style={{ backgroundColor: bg, minHeight: '100%', display: 'flex', justifyContent: 'center', padding: '20px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: Math.max(imgW, 400), maxWidth: 500 }}>
        <div style={{ backgroundColor: cardBg, borderRadius: 8, border: `1px solid ${border}`, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 4, backgroundColor: '#0A66C2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>C</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: text }}>Company Name</div>
              <div style={{ fontSize: 12, color: sub }}>Promoted</div>
            </div>
          </div>
          <div style={{ padding: '0 16px 10px', fontSize: 14, color: text, lineHeight: 1.5 }}>
            See how leading businesses are growing with AI automation. →
          </div>
          <div style={{ width: '100%', height: imgH, overflow: 'hidden', backgroundColor: '#000' }}>
            {dataUrl
              ? <img src={dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 13 }}>{spec.width}×{spec.height}</div>}
          </div>
          <div style={{ display: 'flex', padding: '10px 16px', borderBottom: `1px solid ${border}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: text }}>Your headline</div>
              <div style={{ fontSize: 12, color: sub }}>sponsoredcompany.com</div>
            </div>
            <div style={{ backgroundColor: '#0A66C2', color: '#fff', padding: '6px 16px', borderRadius: 16, fontSize: 13, fontWeight: 600, alignSelf: 'center', whiteSpace: 'nowrap' }}>Learn more</div>
          </div>
          <div style={{ display: 'flex', padding: '4px 8px' }}>
            {['👍 Like', '💬 Comment', '🔄 Repost', '✈️ Send'].map(a => (
              <div key={a} style={{ flex: 1, padding: '8px 4px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: sub, cursor: 'pointer' }}>{a}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DisplayMock({ spec, dataUrl, dark }: { spec: AdSpec; dataUrl: string; dark: boolean }) {
  const bg = dark ? '#1a1a1a' : '#f5f5f5'
  const textC = dark ? '#ccc' : '#333'
  const cardBg = dark ? '#2a2a2a' : '#fff'
  const aspect = spec.width / spec.height
  const isMrec = spec.width <= 336
  const isLeader = spec.height < 120
  const dispW = Math.min(spec.width, 400)
  const dispH = Math.round(dispW / aspect)

  return (
    <div style={{ backgroundColor: bg, minHeight: '100%', padding: 24, fontFamily: 'Georgia, serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontSize: 11, color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>News &amp; Analysis</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: textC, marginBottom: 12, lineHeight: 1.3 }}>
          AI Automation Reshapes How Agencies Work in 2026
        </h1>

        {isLeader && (
          <div style={{ margin: '16px 0', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', border: '1px solid rgba(128,128,128,0.3)', overflow: 'hidden' }}>
              {dataUrl ? <img src={dataUrl} alt="ad" style={{ display: 'block', width: dispW, height: dispH }} />
                : <div style={{ width: dispW, height: dispH, backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#888' }}>{spec.width}×{spec.height}</div>}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            {['Agencies that fail to adapt risk being left behind as AI-native competitors enter the market.','New research from BRAIVE Institute shows that automation has cut campaign setup time by 70% across early adopters.','The shift is not just about efficiency — it fundamentally changes the role of the creative professional.'].map((t, i) => (
              <p key={i} style={{ fontSize: 15, lineHeight: 1.7, color: textC, marginBottom: 16 }}>{t}</p>
            ))}
          </div>
          {isMrec && (
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 9, color: '#999', textAlign: 'center', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Advertisement</div>
              <div style={{ border: '1px solid rgba(128,128,128,0.3)', overflow: 'hidden' }}>
                {dataUrl ? <img src={dataUrl} alt="ad" style={{ display: 'block', width: dispW, height: dispH }} />
                  : <div style={{ width: dispW, height: dispH, backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#888' }}>{spec.width}×{spec.height}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function GenericMock({ spec, dataUrl }: { spec: AdSpec; dataUrl: string }) {
  const aspect = spec.width / spec.height
  const dispW = Math.min(spec.width, 500)
  const dispH = Math.round(dispW / aspect)
  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-block', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', borderRadius: 4 }}>
          {dataUrl ? <img src={dataUrl} alt="ad" style={{ display: 'block', width: dispW, height: dispH }} />
            : <div style={{ width: dispW, height: dispH, backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 14 }}>{spec.width}×{spec.height}</div>}
        </div>
        <div style={{ color: '#666', fontSize: 12, marginTop: 8 }}>{spec.name} · {spec.width}×{spec.height}</div>
      </div>
    </div>
  )
}

export default function InSituPreview({ specs, dataUrls, platformId, onClose }: InSituPreviewProps) {
  const [specIndex, setSpecIndex] = useState(0)
  const [dark, setDark] = useState(true)
  const spec = specs[specIndex]
  const dataUrl = dataUrls[spec?.id] || ''

  const getMock = () => {
    if (!spec) return null
    const isStories = spec.height / spec.width > 1.6
    const isDisplay = ['iab-', 'gdn-', 'prog-'].some(p => spec.id.startsWith(p))
    if (platformId === 'meta' && isStories) return <MetaStoriesMock spec={spec} dataUrl={dataUrl} dark={dark} />
    if (platformId === 'meta') return <MetaFeedMock spec={spec} dataUrl={dataUrl} dark={dark} />
    if (platformId === 'linkedin') return <LinkedInMock spec={spec} dataUrl={dataUrl} dark={dark} />
    if (isDisplay || platformId === 'display-core' || platformId === 'display-extended' || platformId === 'programmatic') return <DisplayMock spec={spec} dataUrl={dataUrl} dark={dark} />
    return <GenericMock spec={spec} dataUrl={dataUrl} />
  }

  if (!spec) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col" onClick={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-white">In-situ Preview</span>
          <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1">
            <button onClick={() => setDark(true)} className={`px-3 py-1 rounded-md text-xs font-medium transition ${dark ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Dark</button>
            <button onClick={() => setDark(false)} className={`px-3 py-1 rounded-md text-xs font-medium transition ${!dark ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Light</button>
          </div>
        </div>
        {/* Spec selector */}
        <div className="flex items-center gap-2">
          <button onClick={() => setSpecIndex(i => Math.max(0, i - 1))} disabled={specIndex === 0}
            className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center justify-center">‹</button>
          <div className="flex gap-1">
            {specs.map((s, i) => (
              <button key={s.id} onClick={() => setSpecIndex(i)}
                className={`px-2 py-1 rounded text-xs transition ${i === specIndex ? 'bg-white/15 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {s.width}×{s.height}
              </button>
            ))}
          </div>
          <button onClick={() => setSpecIndex(i => Math.min(specs.length - 1, i + 1))} disabled={specIndex === specs.length - 1}
            className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center justify-center">›</button>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm px-3 py-1 rounded bg-white/5 hover:bg-white/10 transition">✕ Close</button>
      </div>

      {/* Spec label */}
      <div className="text-center py-2 text-xs text-zinc-600" onClick={e => e.stopPropagation()}>
        {spec.name} · {spec.width}×{spec.height} · {spec.placement}
        {!dataUrl && <span className="ml-2 text-orange-400">Export this size first to preview</span>}
      </div>

      {/* Mock */}
      <div className="flex-1 overflow-auto" onClick={e => e.stopPropagation()}>
        {getMock()}
      </div>
    </div>
  )
}

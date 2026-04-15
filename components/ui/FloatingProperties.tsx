'use client'

import { useEffect, useRef } from 'react'
import { ElementPlacement, ElementOverride, BrandKit } from '@/types'

interface FloatingPropertiesProps {
  element: ElementPlacement
  override: ElementOverride
  locked: boolean
  brandKit: BrandKit
  specId: string
  elementIndex: number
  anchorX: number
  anchorY: number
  onChange: (specId: string, index: number, override: ElementOverride) => void
  onLockToggle: (specId: string, index: number) => void
  onApplyToAll: (index: number, override: ElementOverride) => void
  onClose: () => void
}

export default function FloatingProperties({
  element, override, locked, brandKit, specId, elementIndex,
  anchorX, anchorY, onChange, onLockToggle, onApplyToAll, onClose
}: FloatingPropertiesProps) {
  const ref = useRef<HTMLDivElement>(null)
  const m = { ...element, ...override }
  const update = (patch: Partial<ElementOverride>) => {
    const next = { ...override, ...patch }
    onChange(specId, elementIndex, next)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 100)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Position: show above anchor, flip below if too close to top, clamp to screen edges
  const panelW = 280
  const panelH = 180 // approximate
  const left = Math.max(16, Math.min(anchorX - panelW / 2, (typeof window !== 'undefined' ? window.innerWidth : 1200) - panelW - 16))
  const showAbove = anchorY > panelH + 60
  const top = showAbove ? anchorY - 12 : anchorY + 24

  const isText = element.type === 'headline' || element.type === 'subheadline' || element.type === 'cta'
  const typeLabel: Record<string, string> = { headline: 'Headline', subheadline: 'Sub-headline', cta: 'CTA Button', overlay: 'Overlay', logo: 'Logo' }

  return (
    <div ref={ref} className="fixed z-50 shadow-2xl rounded-xl border"
      style={{ left, top, width: panelW, backgroundColor: '#1A1A1F', borderColor: 'rgba(255,255,255,0.1)', transform: showAbove ? 'translateY(-100%)' : 'none' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <span className="text-xs font-semibold" style={{ color: 'var(--braive-text)' }}>{typeLabel[element.type]}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onApplyToAll(elementIndex, override)}
            className="text-xs px-2 py-1 rounded font-medium transition"
            style={{ backgroundColor: 'rgba(91,106,240,0.15)', color: '#5B6AF0' }}
            title="Apply these changes to all canvases">
            Apply to all
          </button>
          <button onClick={() => onLockToggle(specId, elementIndex)}
            className="w-6 h-6 rounded flex items-center justify-center text-sm transition"
            style={{ backgroundColor: locked ? 'rgba(91,106,240,0.2)' : 'rgba(255,255,255,0.05)', color: locked ? '#5B6AF0' : 'var(--braive-muted)' }}>
            {locked ? '🔒' : '🔓'}
          </button>
          <button onClick={onClose} className="w-6 h-6 rounded flex items-center justify-center text-xs transition"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--braive-muted)' }}>✕</button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {isText && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16" style={{ color: 'var(--braive-muted)' }}>Size</span>
              <div className="flex items-center gap-1.5 flex-1">
                <button onClick={() => update({ fontSize: Math.max(8, (m.fontSize || 16) - 1) })}
                  className="w-7 h-7 rounded text-sm font-mono transition flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--braive-text)' }}>−</button>
                <input type="number" min={8} max={120} value={m.fontSize || 16}
                  onChange={e => update({ fontSize: Math.max(8, +e.target.value) })}
                  className="flex-1 rounded text-center text-sm font-mono focus:outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--braive-text)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px' }} />
                <button onClick={() => update({ fontSize: (m.fontSize || 16) + 1 })}
                  className="w-7 h-7 rounded text-sm font-mono transition flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--braive-text)' }}>+</button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs w-16" style={{ color: 'var(--braive-muted)' }}>Style</span>
              <div className="flex gap-1.5">
                {[['B','bold'],['I','italic']].map(([label, style]) => (
                  <button key={style} onClick={() => update({ fontStyle: m.fontStyle === style ? 'normal' : style })}
                    className="w-8 h-7 rounded text-sm transition"
                    style={{
                      backgroundColor: m.fontStyle === style ? 'var(--braive-accent)' : 'rgba(255,255,255,0.06)',
                      color: m.fontStyle === style ? '#fff' : 'var(--braive-muted)',
                      fontWeight: style === 'bold' ? 700 : 400,
                      fontStyle: style === 'italic' ? 'italic' : 'normal'
                    }}>{label}</button>
                ))}
                {element.type !== 'cta' && (['left','center','right'] as const).map(a => (
                  <button key={a} onClick={() => update({ textAlign: a })}
                    className="w-8 h-7 rounded text-xs transition"
                    style={{ backgroundColor: m.textAlign === a ? 'rgba(91,106,240,0.3)' : 'rgba(255,255,255,0.06)', color: m.textAlign === a ? '#fff' : 'var(--braive-muted)' }}>
                    {a === 'left' ? '⬛' : a === 'center' ? '▣' : '⬛'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs w-16" style={{ color: 'var(--braive-muted)' }}>Colour</span>
              <div className="flex items-center gap-2 flex-1">
                <input type="color" value={m.color || '#ffffff'} onChange={e => update({ color: e.target.value })}
                  className="w-8 h-8 rounded border-0 bg-transparent" />
                <input type="text" value={m.color || '#ffffff'} onChange={e => update({ color: e.target.value })}
                  className="flex-1 rounded px-2 py-1.5 text-xs font-mono focus:outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--braive-text)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            </div>
          </>
        )}

        {element.type === 'cta' && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16" style={{ color: 'var(--braive-muted)' }}>BG</span>
              <div className="flex items-center gap-2 flex-1">
                <input type="color" value={m.backgroundColor || brandKit.primaryColor} onChange={e => update({ backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded border-0 bg-transparent" />
                <input type="text" value={m.backgroundColor || brandKit.primaryColor} onChange={e => update({ backgroundColor: e.target.value })}
                  className="flex-1 rounded px-2 py-1.5 text-xs font-mono focus:outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--braive-text)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16" style={{ color: 'var(--braive-muted)' }}>Radius</span>
              <input type="range" min={0} max={28} value={m.borderRadius ?? 8} onChange={e => update({ borderRadius: +e.target.value })} className="flex-1" />
              <span className="text-xs w-6 font-mono" style={{ color: 'var(--braive-muted)' }}>{m.borderRadius ?? 8}</span>
            </div>
          </>
        )}

        {element.type === 'overlay' && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16" style={{ color: 'var(--braive-muted)' }}>Colour</span>
              <div className="flex items-center gap-2 flex-1">
                <input type="color" value={m.backgroundColor || '#000000'} onChange={e => update({ backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded border-0 bg-transparent" />
                <input type="text" value={m.backgroundColor || '#000000'} onChange={e => update({ backgroundColor: e.target.value })}
                  className="flex-1 rounded px-2 py-1.5 text-xs font-mono focus:outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--braive-text)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16" style={{ color: 'var(--braive-muted)' }}>Opacity</span>
              <input type="range" min={0} max={100} value={Math.round((m.opacity ?? 0.5) * 100)} onChange={e => update({ opacity: +e.target.value / 100 })} className="flex-1" />
              <span className="text-xs w-8 font-mono text-right" style={{ color: 'var(--braive-muted)' }}>{Math.round((m.opacity ?? 0.5) * 100)}%</span>
            </div>
          </>
        )}

        {element.type === 'logo' && (
          <p className="text-xs text-center py-2" style={{ color: 'var(--braive-muted)' }}>Drag to reposition · Update logo in Brand tab</p>
        )}
      </div>
    </div>
  )
}

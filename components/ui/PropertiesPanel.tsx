'use client'

import { ElementPlacement, ElementOverride, BrandKit } from '@/types'

interface PropertiesPanelProps {
  element: ElementPlacement
  override: ElementOverride
  locked: boolean
  brandKit: BrandKit
  specId: string
  elementIndex: number
  onChange: (specId: string, index: number, override: ElementOverride) => void
  onLockToggle: (specId: string, index: number) => void
  onClose: () => void
}

export default function PropertiesPanel({
  element, override, locked, brandKit, specId, elementIndex, onChange, onLockToggle, onClose
}: PropertiesPanelProps) {
  const m = { ...element, ...override }
  const update = (patch: Partial<ElementOverride>) => onChange(specId, elementIndex, { ...override, ...patch })

  const isText = element.type === 'headline' || element.type === 'subheadline' || element.type === 'cta'
  const typeLabel: Record<string, string> = {
    headline: 'Headline', subheadline: 'Sub-headline', cta: 'CTA Button',
    overlay: 'Overlay', logo: 'Logo', image: 'Image'
  }

  return (
    <div className="w-56 border-l border-white/5 bg-zinc-950 flex flex-col flex-shrink-0 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div>
          <div className="text-xs font-semibold text-white">{typeLabel[element.type] || element.type}</div>
          <div className="text-xs text-zinc-600 mt-0.5">Properties</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onLockToggle(specId, elementIndex)}
            title={locked ? 'Unlock element' : 'Lock element'}
            className={`w-7 h-7 rounded flex items-center justify-center text-sm transition ${locked ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-zinc-500 hover:text-zinc-300'}`}>
            {locked ? '🔒' : '🔓'}
          </button>
          <button onClick={onClose} className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-zinc-300 flex items-center justify-center text-xs transition">✕</button>
        </div>
      </div>

      <div className="p-4 space-y-5 flex-1">

        {/* Text controls */}
        {isText && (
          <>
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Font Size</label>
              <div className="flex items-center gap-2">
                <button onClick={() => update({ fontSize: Math.max(8, (m.fontSize || 16) - 1) })}
                  className="w-8 h-8 rounded bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white flex items-center justify-center text-sm font-mono transition">−</button>
                <input type="number" min={8} max={120} value={m.fontSize || 16}
                  onChange={e => update({ fontSize: Math.max(8, +e.target.value) })}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-sm text-white font-mono text-center focus:outline-none focus:border-white/30" />
                <button onClick={() => update({ fontSize: (m.fontSize || 16) + 1 })}
                  className="w-8 h-8 rounded bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white flex items-center justify-center text-sm font-mono transition">+</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Style</label>
              <div className="flex gap-1.5">
                <button onClick={() => update({ fontStyle: m.fontStyle === 'bold' ? 'normal' : 'bold' })}
                  className={`flex-1 h-8 rounded border text-sm font-bold transition ${m.fontStyle === 'bold' ? 'bg-white text-zinc-900 border-white' : 'bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/25'}`}>B</button>
                <button onClick={() => update({ fontStyle: m.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  className={`flex-1 h-8 rounded border text-sm italic transition ${m.fontStyle === 'italic' ? 'bg-white text-zinc-900 border-white' : 'bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/25'}`}>I</button>
              </div>
            </div>

            {element.type !== 'cta' && (
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Alignment</label>
                <div className="flex gap-1.5">
                  {(['left', 'center', 'right'] as const).map(a => (
                    <button key={a} onClick={() => update({ textAlign: a })}
                      className={`flex-1 h-8 rounded border text-xs transition ${m.textAlign === a ? 'bg-white/15 border-white/30 text-white' : 'bg-zinc-900 border-white/10 text-zinc-500 hover:border-white/25'}`}>
                      {a === 'left' ? '≡ Left' : a === 'center' ? '≡ Ctr' : '≡ Rt'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Text Colour</label>
              <div className="flex items-center gap-2">
                <input type="color" value={m.color || '#ffffff'}
                  onChange={e => update({ color: e.target.value })}
                  className="w-9 h-9 rounded cursor-pointer bg-transparent border-0 flex-shrink-0" />
                <input type="text" value={m.color || '#ffffff'}
                  onChange={e => update({ color: e.target.value })}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/30" />
              </div>
            </div>
          </>
        )}

        {/* CTA specific */}
        {element.type === 'cta' && (
          <>
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Button Colour</label>
              <div className="flex items-center gap-2">
                <input type="color" value={m.backgroundColor || brandKit.primaryColor}
                  onChange={e => update({ backgroundColor: e.target.value })}
                  className="w-9 h-9 rounded cursor-pointer bg-transparent border-0 flex-shrink-0" />
                <input type="text" value={m.backgroundColor || brandKit.primaryColor}
                  onChange={e => update({ backgroundColor: e.target.value })}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/30" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Corner Radius</label>
                <span className="text-xs text-zinc-400 font-mono">{m.borderRadius ?? 8}px</span>
              </div>
              <input type="range" min={0} max={28} value={m.borderRadius ?? 8}
                onChange={e => update({ borderRadius: +e.target.value })}
                className="w-full accent-orange-500" />
            </div>
          </>
        )}

        {/* Overlay specific */}
        {element.type === 'overlay' && (
          <>
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Colour</label>
              <div className="flex items-center gap-2">
                <input type="color" value={m.backgroundColor || '#000000'}
                  onChange={e => update({ backgroundColor: e.target.value })}
                  className="w-9 h-9 rounded cursor-pointer bg-transparent border-0 flex-shrink-0" />
                <input type="text" value={m.backgroundColor || '#000000'}
                  onChange={e => update({ backgroundColor: e.target.value })}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/30" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Opacity</label>
                <span className="text-xs text-zinc-400 font-mono">{Math.round((m.opacity ?? 0.5) * 100)}%</span>
              </div>
              <div className="h-5 rounded border border-white/10 overflow-hidden relative mb-2">
                <div className="absolute inset-0" style={{ background: 'repeating-conic-gradient(#333 0% 25%, #555 0% 50%) 0 0 / 10px 10px' }} />
                <div className="absolute inset-0" style={{ backgroundColor: m.backgroundColor || '#000000', opacity: m.opacity ?? 0.5 }} />
              </div>
              <input type="range" min={0} max={100} value={Math.round((m.opacity ?? 0.5) * 100)}
                onChange={e => update({ opacity: +e.target.value / 100 })}
                className="w-full accent-orange-500" />
            </div>
          </>
        )}

        {element.type === 'logo' && (
          <div className="text-xs text-zinc-500 text-center py-4">
            Drag to reposition.<br />Upload a new logo in the Brand tab.
          </div>
        )}

        {locked && (
          <div className="mt-2 text-xs text-orange-400/80 text-center py-2 bg-orange-500/5 rounded border border-orange-500/20">
            Element is locked — unlock to edit
          </div>
        )}
      </div>

      {/* Position info */}
      <div className="px-4 py-3 border-t border-white/5 text-xs text-zinc-700 font-mono">
        {element.x},{element.y} · {element.width}×{element.height}
      </div>
    </div>
  )
}

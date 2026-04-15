'use client'

import { StyleDefaults } from '@/types'

interface StylePanelProps {
  style: StyleDefaults
  onChange: (s: StyleDefaults) => void
}

export default function StylePanel({ style, onChange }: StylePanelProps) {
  const u = (key: keyof StyleDefaults, value: string | number) => onChange({ ...style, [key]: value })

  return (
    <div className="space-y-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Style Defaults</h3>
      <p className="text-xs text-zinc-600 -mt-3">Applied on next Generate. Click elements on canvas to tweak individually.</p>

      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-xs text-zinc-400">Font Size Scale</label>
          <span className="text-xs text-zinc-300 font-mono">{style.fontSizeScale.toFixed(1)}×</span>
        </div>
        {/* Live preview */}
        <div className="bg-zinc-900 rounded px-3 py-2 border border-white/5">
          <span style={{ fontSize: clamp(style.fontSizeScale * 14, 9, 26), color: '#fff', fontWeight: 'bold', lineHeight: 1 }}>
            Aa
          </span>
          <span className="text-zinc-600 text-xs ml-2">headline preview</span>
        </div>
        <input type="range" min={50} max={200} value={Math.round(style.fontSizeScale * 100)}
          onChange={e => u('fontSizeScale', +e.target.value / 100)}
          className="w-full accent-orange-500" />
        <div className="flex justify-between text-xs text-zinc-700"><span>0.5×</span><span>1.0×</span><span>2.0×</span></div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-xs text-zinc-400">Overlay Opacity</label>
          <span className="text-xs text-zinc-300 font-mono">{Math.round(style.overlayOpacity * 100)}%</span>
        </div>
        <div className="h-6 rounded border border-white/10 overflow-hidden relative">
          <div className="absolute inset-0" style={{ background: 'repeating-conic-gradient(#333 0% 25%, #555 0% 50%) 0 0 / 12px 12px' }} />
          <div className="absolute inset-0 rounded" style={{ backgroundColor: style.overlayColor, opacity: style.overlayOpacity }} />
        </div>
        <input type="range" min={0} max={100} value={Math.round(style.overlayOpacity * 100)}
          onChange={e => u('overlayOpacity', +e.target.value / 100)}
          className="w-full accent-orange-500" />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-zinc-400">Overlay Position</label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['top', 'auto', 'bottom'] as const).map(p => (
            <button key={p} onClick={() => u('overlayPosition', p)}
              className={`py-1.5 rounded text-xs font-medium capitalize transition ${style.overlayPosition === p ? 'bg-orange-500 text-white' : 'bg-zinc-900 text-zinc-400 border border-white/10 hover:border-white/20'}`}>
              {p === 'auto' ? '✦ Auto' : p === 'top' ? '↑ Top' : '↓ Bottom'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Text Colour</label>
          <div className="flex items-center gap-2">
            <input type="color" value={style.textColor} onChange={e => u('textColor', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
            <input type="text" value={style.textColor} onChange={e => u('textColor', e.target.value)}
              className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/30" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Overlay Colour</label>
          <div className="flex items-center gap-2">
            <input type="color" value={style.overlayColor} onChange={e => u('overlayColor', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
            <input type="text" value={style.overlayColor} onChange={e => u('overlayColor', e.target.value)}
              className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/30" />
          </div>
        </div>
      </div>
    </div>
  )
}

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)) }

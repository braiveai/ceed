'use client'

import { StyleDefaults } from '@/types'

interface StylePanelProps {
  style: StyleDefaults
  onChange: (s: StyleDefaults) => void
}

export default function StylePanel({ style, onChange }: StylePanelProps) {
  const update = (key: keyof StyleDefaults, value: string | number) =>
    onChange({ ...style, [key]: value })

  return (
    <div className="space-y-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Style Defaults</h3>
      <p className="text-xs text-zinc-600 -mt-3">Applied on next Generate. Click elements on canvas to override individually.</p>

      <div className="space-y-1">
        <div className="flex justify-between">
          <label className="text-xs text-zinc-400">Font Size Scale</label>
          <span className="text-xs text-zinc-300">{style.fontSizeScale.toFixed(1)}×</span>
        </div>
        <input type="range" min={50} max={200} value={Math.round(style.fontSizeScale * 100)}
          onChange={e => update('fontSizeScale', Number(e.target.value) / 100)}
          className="w-full accent-orange-500" />
        <div className="flex justify-between text-xs text-zinc-600">
          <span>0.5×</span><span>1.0×</span><span>2.0×</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <label className="text-xs text-zinc-400">Overlay Opacity</label>
          <span className="text-xs text-zinc-300">{Math.round(style.overlayOpacity * 100)}%</span>
        </div>
        <input type="range" min={0} max={100} value={Math.round(style.overlayOpacity * 100)}
          onChange={e => update('overlayOpacity', Number(e.target.value) / 100)}
          className="w-full accent-orange-500" />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Overlay Position</label>
        <div className="grid grid-cols-3 gap-1.5 mt-1">
          {(['top', 'auto', 'bottom'] as const).map(p => (
            <button key={p}
              onClick={() => update('overlayPosition', p)}
              className={`py-1.5 rounded text-xs font-medium capitalize transition ${style.overlayPosition === p ? 'bg-orange-500 text-white' : 'bg-zinc-900 text-zinc-400 border border-white/10 hover:border-white/20'}`}
            >{p === 'auto' ? 'Auto (AI)' : p}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Text Colour</label>
          <div className="flex items-center gap-2">
            <input type="color" value={style.textColor}
              onChange={e => update('textColor', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
            <input type="text" value={style.textColor}
              onChange={e => update('textColor', e.target.value)}
              className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/30" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Overlay Colour</label>
          <div className="flex items-center gap-2">
            <input type="color" value={style.overlayColor}
              onChange={e => update('overlayColor', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
            <input type="text" value={style.overlayColor}
              onChange={e => update('overlayColor', e.target.value)}
              className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/30" />
          </div>
        </div>
      </div>
    </div>
  )
}

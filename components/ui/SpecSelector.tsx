'use client'

import { SPEC_SETS } from '@/lib/specs'

interface SpecSelectorProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function SpecSelector({ selected, onChange }: SpecSelectorProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const totalSpecs = SPEC_SETS
    .filter(s => selected.includes(s.id))
    .reduce((acc, s) => acc + s.specs.length, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Platforms</h3>
        {totalSpecs > 0 && (
          <span className="text-xs text-zinc-500">{totalSpecs} sizes selected</span>
        )}
      </div>

      <div className="space-y-1.5">
        {SPEC_SETS.map(set => {
          const isOn = selected.includes(set.id)
          return (
            <button
              key={set.id}
              onClick={() => toggle(set.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-sm transition ${
                isOn
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isOn ? set.color : '#444' }}
                />
                <span className="font-medium">{set.label}</span>
              </div>
              <span className="text-xs text-zinc-500">{set.specs.length} sizes</span>
            </button>
          )
        })}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onChange(SPEC_SETS.map(s => s.id))}
          className="flex-1 text-xs py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
        >
          Select All
        </button>
        <button
          onClick={() => onChange([])}
          className="flex-1 text-xs py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

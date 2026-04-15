'use client'

import { CopySet } from '@/types'

interface CopyPanelProps {
  copySet: CopySet
  onChange: (copy: CopySet) => void
}

export default function CopyPanel({ copySet, onChange }: CopyPanelProps) {
  const update = (key: keyof CopySet, value: string) => {
    onChange({ ...copySet, [key]: value })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Copy</h3>

      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Headline</label>
        <input
          type="text"
          value={copySet.headline}
          onChange={e => update('headline', e.target.value)}
          placeholder="Your main headline"
          maxLength={60}
          className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
        />
        <div className="text-right text-xs text-zinc-600">{copySet.headline.length}/60</div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Sub-headline</label>
        <input
          type="text"
          value={copySet.subHeadline}
          onChange={e => update('subHeadline', e.target.value)}
          placeholder="Supporting message"
          maxLength={90}
          className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
        />
        <div className="text-right text-xs text-zinc-600">{copySet.subHeadline.length}/90</div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-400">CTA Button Text</label>
        <input
          type="text"
          value={copySet.ctaText}
          onChange={e => update('ctaText', e.target.value)}
          placeholder="Learn More"
          maxLength={25}
          className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
        />
        <div className="text-right text-xs text-zinc-600">{copySet.ctaText.length}/25</div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Body Text <span className="text-zinc-600">(optional)</span></label>
        <textarea
          value={copySet.bodyText || ''}
          onChange={e => update('bodyText', e.target.value)}
          placeholder="Additional supporting copy..."
          rows={2}
          maxLength={150}
          className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 resize-none"
        />
      </div>
    </div>
  )
}

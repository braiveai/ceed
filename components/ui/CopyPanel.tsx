'use client'

import { useState } from 'react'
import { CopySet } from '@/types'

interface CopyPanelProps {
  copySet: CopySet
  companyName?: string
  onChange: (copy: CopySet) => void
}

export default function CopyPanel({ copySet, companyName, onChange }: CopyPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [variants, setVariants] = useState<Array<{ headline: string; subHeadline: string; ctaText: string }>>([])
  const [offer, setOffer] = useState('')
  const [showVariants, setShowVariants] = useState(false)

  const u = (key: keyof CopySet, val: string) => onChange({ ...copySet, [key]: val })

  const generateVariants = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/copyVariants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, industry: offer }),
      })
      if (res.ok) {
        const { variants: v } = await res.json()
        setVariants(v)
        setShowVariants(true)
      }
    } catch {}
    setIsGenerating(false)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Copy</h3>

      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Headline</label>
        <input type="text" value={copySet.headline} onChange={e => u('headline', e.target.value)}
          placeholder="Your main headline" maxLength={60}
          className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30" />
        <div className="text-right text-xs text-zinc-600">{copySet.headline.length}/60</div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Sub-headline</label>
        <input type="text" value={copySet.subHeadline} onChange={e => u('subHeadline', e.target.value)}
          placeholder="Supporting message" maxLength={90}
          className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30" />
        <div className="text-right text-xs text-zinc-600">{copySet.subHeadline.length}/90</div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-400">CTA Button</label>
        <input type="text" value={copySet.ctaText} onChange={e => u('ctaText', e.target.value)}
          placeholder="Learn More" maxLength={25}
          className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30" />
      </div>

      {/* AI Copy Variants */}
      <div className="border border-white/5 rounded-lg p-3 space-y-2 bg-zinc-900/50">
        <div className="text-xs text-zinc-400 font-medium">✦ AI Copy Variants</div>
        <input type="text" value={offer} onChange={e => setOffer(e.target.value)}
          placeholder="Describe your offer (e.g. $99 hot water callouts)"
          className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/30" />
        <button onClick={generateVariants} disabled={isGenerating}
          className={`w-full py-1.5 rounded text-xs font-medium transition ${isGenerating ? 'bg-zinc-800 text-zinc-600' : 'bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30'}`}>
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 border border-orange-400/30 border-t-orange-400 rounded-full animate-spin block" />
              Generating…
            </span>
          ) : 'Generate 3 variants'}
        </button>

        {showVariants && variants.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {variants.map((v, i) => (
              <button key={i} onClick={() => { onChange({ ...copySet, headline: v.headline, subHeadline: v.subHeadline, ctaText: v.ctaText }); setShowVariants(false) }}
                className="w-full text-left p-2 rounded bg-zinc-800 hover:bg-zinc-700 border border-white/5 hover:border-white/15 transition space-y-0.5">
                <div className="text-xs font-semibold text-white">{v.headline}</div>
                <div className="text-xs text-zinc-400">{v.subHeadline}</div>
                <div className="text-xs text-orange-400 font-medium">{v.ctaText} →</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

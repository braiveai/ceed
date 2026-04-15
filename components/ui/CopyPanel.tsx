'use client'

import { useState } from 'react'
import { CopySet } from '@/types'

interface Variant { headline: string; subHeadline: string; ctaText: string }
interface CopyPanelProps {
  copySet: CopySet
  companyName?: string
  onChange: (copy: CopySet) => void
  onApplyVariant?: (variant: Variant) => void
}

export default function CopyPanel({ copySet, companyName, onChange, onApplyVariant }: CopyPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [variants, setVariants] = useState<Variant[]>([])
  const [offer, setOffer] = useState('')
  const [activeVariant, setActiveVariant] = useState<number | null>(null)

  const u = (key: keyof CopySet, val: string) => onChange({ ...copySet, [key]: val })

  const generateVariants = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/copyVariants', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, industry: offer }),
      })
      if (res.ok) { const { variants: v } = await res.json(); setVariants(v) }
    } catch {}
    setIsGenerating(false)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Copy</h3>

      {/* Active variant indicator */}
      {activeVariant !== null && (
        <div className="flex items-center justify-between text-xs bg-orange-500/10 border border-orange-500/20 rounded px-2.5 py-1.5">
          <span className="text-orange-400 font-medium">Using Variant {['A','B','C'][activeVariant]}</span>
          <button onClick={() => { setActiveVariant(null); onChange(copySet) }} className="text-zinc-500 hover:text-zinc-300">Reset to main</button>
        </div>
      )}

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

      {/* AI Variants — as alternative campaigns */}
      <div className="border border-white/5 rounded-lg overflow-hidden">
        <div className="bg-zinc-900/80 px-3 py-2.5 flex items-center justify-between">
          <div className="text-xs font-medium text-zinc-300">✦ Copy Variants</div>
          <div className="text-xs text-zinc-600">generates a separate subset</div>
        </div>
        <div className="p-3 space-y-2.5">
          <input type="text" value={offer} onChange={e => setOffer(e.target.value)}
            placeholder="Describe your offer (e.g. $99 hot water callouts)"
            className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/30" />
          <button onClick={generateVariants} disabled={isGenerating}
            className={`w-full py-1.5 rounded text-xs font-medium transition ${isGenerating ? 'bg-zinc-800 text-zinc-600' : 'bg-orange-500/15 border border-orange-500/25 text-orange-400 hover:bg-orange-500/25'}`}>
            {isGenerating ? <span className="flex items-center justify-center gap-2"><span className="w-3 h-3 border border-orange-400/30 border-t-orange-400 rounded-full animate-spin block" />Generating…</span> : '✦ Generate 3 variants'}
          </button>

          {variants.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="text-xs text-zinc-600 pb-1">Click "Use this" to generate a separate canvas set with that copy</div>
              {variants.map((v, i) => (
                <div key={i} className={`rounded border transition ${activeVariant === i ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/5 bg-zinc-900'}`}>
                  <div className="px-3 pt-2.5 pb-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-zinc-400">Variant {['A','B','C'][i]}</span>
                      <button
                        onClick={() => { setActiveVariant(i); onApplyVariant?.(v) }}
                        className={`text-xs px-2.5 py-1 rounded font-medium transition ${activeVariant === i ? 'bg-orange-500 text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-300'}`}>
                        {activeVariant === i ? 'Active' : 'Use this'}
                      </button>
                    </div>
                    <div className="text-xs font-semibold text-white leading-tight">{v.headline}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{v.subHeadline}</div>
                    <div className="text-xs text-orange-400 font-medium mt-1">{v.ctaText} →</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

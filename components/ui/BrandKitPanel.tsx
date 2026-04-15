'use client'

import { useRef, useEffect, useState } from 'react'
import { BrandKit } from '@/types'

const GOOGLE_FONTS = ['Montserrat','Inter','Roboto','Poppins','Lato','Raleway','Oswald','Merriweather','Playfair Display','Nunito','Work Sans','DM Sans','Outfit','Plus Jakarta Sans','Barlow']

const STORAGE_KEY = 'ceed_saved_kits'

interface BrandKitPanelProps {
  brandKit: BrandKit
  onChange: (kit: BrandKit) => void
}

export default function BrandKitPanel({ brandKit, onChange }: BrandKitPanelProps) {
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [savedKits, setSavedKits] = useState<Record<string, BrandKit>>({})
  const [kitName, setKitName] = useState('')
  const [showSave, setShowSave] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSavedKits(JSON.parse(stored))
    } catch {}
  }, [])

  const saveKit = () => {
    if (!kitName.trim()) return
    const updated = { ...savedKits, [kitName.trim()]: brandKit }
    setSavedKits(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setKitName('')
    setShowSave(false)
  }

  const loadKit = (name: string) => { onChange(savedKits[name]) }

  const deleteKit = (name: string) => {
    const updated = { ...savedKits }
    delete updated[name]
    setSavedKits(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onChange({ ...brandKit, logoUrl: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  const u = (key: keyof BrandKit, value: string) => onChange({ ...brandKit, [key]: value })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Brand Kit</h3>
        <div className="flex gap-1">
          {Object.keys(savedKits).length > 0 && (
            <select onChange={e => e.target.value && loadKit(e.target.value)} defaultValue=""
              className="text-xs bg-zinc-900 border border-white/10 rounded px-1.5 py-1 text-zinc-400 focus:outline-none">
              <option value="" disabled>Load kit…</option>
              {Object.keys(savedKits).map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          )}
          <button onClick={() => setShowSave(!showSave)}
            className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-white/10">Save</button>
        </div>
      </div>

      {showSave && (
        <div className="flex gap-1.5">
          <input type="text" value={kitName} onChange={e => setKitName(e.target.value)}
            placeholder="Kit name…" onKeyDown={e => e.key === 'Enter' && saveKit()}
            className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/30" />
          <button onClick={saveKit} className="px-2 py-1.5 rounded bg-orange-500 text-white text-xs font-medium">✓</button>
        </div>
      )}

      {Object.keys(savedKits).length > 0 && showSave && (
        <div className="space-y-1">
          {Object.keys(savedKits).map(n => (
            <div key={n} className="flex items-center justify-between text-xs text-zinc-400 px-2 py-1 rounded bg-zinc-900">
              <span>{n}</span>
              <button onClick={() => deleteKit(n)} className="text-zinc-600 hover:text-red-400">✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Company Name</label>
        <input type="text" value={brandKit.companyName} onChange={e => u('companyName', e.target.value)}
          placeholder="Acme Co."
          className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30" />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Logo</label>
        <div onClick={() => logoInputRef.current?.click()}
          className="w-full h-14 border border-dashed border-white/10 rounded flex items-center justify-center cursor-pointer hover:border-white/25 transition bg-zinc-900/50">
          {brandKit.logoUrl
            ? <img src={brandKit.logoUrl} alt="Logo" className="max-h-11 max-w-full object-contain" />
            : <span className="text-xs text-zinc-500">Click to upload logo (PNG / SVG)</span>}
        </div>
        <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Primary <span className="text-zinc-600">(CTA colour)</span></label>
          <div className="flex items-center gap-2">
            <input type="color" value={brandKit.primaryColor} onChange={e => u('primaryColor', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
            <input type="text" value={brandKit.primaryColor} onChange={e => u('primaryColor', e.target.value)}
              className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/30" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Secondary</label>
          <div className="flex items-center gap-2">
            <input type="color" value={brandKit.secondaryColor} onChange={e => u('secondaryColor', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
            <input type="text" value={brandKit.secondaryColor} onChange={e => u('secondaryColor', e.target.value)}
              className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/30" />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Font</label>
        <select value={brandKit.fontFamily} onChange={e => u('fontFamily', e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30">
          {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
    </div>
  )
}

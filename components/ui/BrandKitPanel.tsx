'use client'

import { useRef } from 'react'
import { BrandKit } from '@/types'

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Montserrat', 'Poppins', 'Lato', 'Raleway',
  'Oswald', 'Merriweather', 'Playfair Display', 'Source Sans Pro',
  'Nunito', 'Work Sans', 'DM Sans', 'Outfit', 'Plus Jakarta Sans'
]

interface BrandKitPanelProps {
  brandKit: BrandKit
  onChange: (kit: BrandKit) => void
}

export default function BrandKitPanel({ brandKit, onChange }: BrandKitPanelProps) {
  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onChange({ ...brandKit, logoUrl: ev.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  const update = (key: keyof BrandKit, value: string) => {
    onChange({ ...brandKit, [key]: value })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Brand Kit</h3>

      {/* Company Name */}
      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Company Name</label>
        <input
          type="text"
          value={brandKit.companyName}
          onChange={e => update('companyName', e.target.value)}
          placeholder="Acme Co."
          className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
        />
      </div>

      {/* Logo Upload */}
      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Logo</label>
        <div
          onClick={() => logoInputRef.current?.click()}
          className="w-full h-16 border border-dashed border-white/10 rounded flex items-center justify-center cursor-pointer hover:border-white/30 transition"
        >
          {brandKit.logoUrl ? (
            <img src={brandKit.logoUrl} alt="Logo" className="max-h-12 max-w-full object-contain" />
          ) : (
            <span className="text-xs text-zinc-500">Click to upload logo (PNG/SVG)</span>
          )}
        </div>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />
      </div>

      {/* Colours */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Primary Colour</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={brandKit.primaryColor}
              onChange={e => update('primaryColor', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={brandKit.primaryColor}
              onChange={e => update('primaryColor', e.target.value)}
              className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Secondary Colour</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={brandKit.secondaryColor}
              onChange={e => update('secondaryColor', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={brandKit.secondaryColor}
              onChange={e => update('secondaryColor', e.target.value)}
              className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

      {/* Font */}
      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Font Family</label>
        <select
          value={brandKit.fontFamily}
          onChange={e => update('fontFamily', e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
        >
          {GOOGLE_FONTS.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

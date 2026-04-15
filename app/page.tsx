'use client'

import { useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import BrandKitPanel from '@/components/ui/BrandKitPanel'
import CopyPanel from '@/components/ui/CopyPanel'
import SpecSelector from '@/components/ui/SpecSelector'
import { SPEC_SETS } from '@/lib/specs'
import { generateFallbackLayout } from '@/lib/fallbackLayout'
import { BrandKit, CopySet, ElementPlacement } from '@/types'

const AdCanvas = dynamic(() => import('@/components/canvas/AdCanvas'), { ssr: false })

const DEFAULT_BRAND: BrandKit = {
  logoUrl: null,
  primaryColor: '#FF4438',
  secondaryColor: '#1a1a2e',
  fontFamily: 'Montserrat',
  companyName: '',
}

const DEFAULT_COPY: CopySet = {
  headline: 'Your Headline Here',
  subHeadline: 'Supporting message that reinforces your offer',
  ctaText: 'Learn More',
  bodyText: '',
}

export default function Home() {
  const [brandKit, setBrandKit] = useState<BrandKit>(DEFAULT_BRAND)
  const [copySet, setCopySet] = useState<CopySet>(DEFAULT_COPY)
  const [selectedSets, setSelectedSets] = useState<string[]>(['meta'])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null)
  const [uploadedMediaType, setUploadedMediaType] = useState<string>('image/jpeg')
  const [layouts, setLayouts] = useState<Record<string, ElementPlacement[]>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('meta')
  const [generatedDataUrls, setGeneratedDataUrls] = useState<Record<string, string>>({})
  const [sidebarTab, setSidebarTab] = useState<'brand' | 'copy' | 'specs'>('brand')

  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const mediaType = file.type
    setUploadedMediaType(mediaType)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setUploadedImage(dataUrl)
      const base64 = dataUrl.split(',')[1]
      setUploadedImageBase64(base64)
    }
    reader.readAsDataURL(file)
  }

  const generateLayouts = useCallback(async () => {
    if (!uploadedImage) return
    setIsGenerating(true)

    const activeSpecs = SPEC_SETS
      .filter(s => selectedSets.includes(s.id))
      .flatMap(s => s.specs)

    const newLayouts: Record<string, ElementPlacement[]> = {}

    const heroSpec = activeSpecs[0]

    if (heroSpec && uploadedImageBase64) {
      try {
        const res = await fetch('/api/analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: uploadedImageBase64,
            mediaType: uploadedMediaType,
            width: heroSpec.width,
            height: heroSpec.height,
            copySet,
            brandKit,
          }),
        })
        if (res.ok) {
          const { layout } = await res.json()
          newLayouts[heroSpec.id] = layout.elements || []
        }
      } catch (e) {
        console.error('Claude analysis failed, using fallback', e)
      }
    }

    for (const spec of activeSpecs) {
      if (!newLayouts[spec.id]) {
        newLayouts[spec.id] = generateFallbackLayout(spec, copySet, brandKit)
      }
    }

    setLayouts(newLayouts)
    setIsGenerating(false)
  }, [uploadedImage, uploadedImageBase64, uploadedMediaType, selectedSets, copySet, brandKit])

  const handleExport = useCallback((dataUrl: string, specId: string) => {
    setGeneratedDataUrls(prev => ({ ...prev, [specId]: dataUrl }))
  }, [])

  const exportAll = async () => {
    const JSZip = (await import('jszip')).default
    const { saveAs } = await import('file-saver')
    const zip = new JSZip()
    const folder = zip.folder('ceed-ads')
    for (const [specId, dataUrl] of Object.entries(generatedDataUrls)) {
      const spec = SPEC_SETS.flatMap(s => s.specs).find(s => s.id === specId)
      if (!spec) continue
      const base64 = dataUrl.replace('data:image/png;base64,', '')
      folder?.file(
        `${spec.platform.replace(/[^a-z0-9]/gi, '-')}-${spec.name.replace(/[^a-z0-9]/gi, '-')}-${spec.width}x${spec.height}.png`,
        base64,
        { base64: true }
      )
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'ceed-ad-set.zip')
  }

  const activeSpecSet = SPEC_SETS.find(s => s.id === activeTab)
  const totalSpecs = SPEC_SETS.filter(s => selectedSets.includes(s.id)).reduce((a, s) => a + s.specs.length, 0)
  const generatedCount = Object.keys(generatedDataUrls).length

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">

      {/* Header */}
      <header className="border-b border-white/5 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xs font-bold">C</div>
          <div className="flex items-baseline gap-2">
            <span className="text-white font-semibold text-sm tracking-tight">Ceed</span>
            <span className="text-zinc-500 text-xs">by BRAIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {generatedCount > 0 && (
            <span className="text-xs text-zinc-500">{generatedCount} / {totalSpecs} exported</span>
          )}
          {generatedCount > 0 && (
            <button
              onClick={exportAll}
              className="px-4 py-2 rounded-lg bg-white text-zinc-900 text-xs font-semibold hover:bg-zinc-100 transition"
            >
              ↓ Download Zip ({generatedCount})
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar */}
        <div className="w-68 border-r border-white/5 flex flex-col overflow-hidden flex-shrink-0" style={{ width: 272 }}>

          {/* Tabs */}
          <div className="flex border-b border-white/5 flex-shrink-0">
            {(['brand', 'copy', 'specs'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className={`flex-1 py-3 text-xs font-medium transition ${
                  sidebarTab === tab
                    ? 'text-white border-b-2 border-orange-500'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab === 'brand' ? 'Brand' : tab === 'copy' ? 'Copy' : 'Platforms'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {sidebarTab === 'brand' && <BrandKitPanel brandKit={brandKit} onChange={setBrandKit} />}
            {sidebarTab === 'copy' && <CopyPanel copySet={copySet} onChange={setCopySet} />}
            {sidebarTab === 'specs' && <SpecSelector selected={selectedSets} onChange={setSelectedSets} />}
          </div>

          {/* Image + Generate */}
          <div className="p-4 border-t border-white/5 space-y-3 flex-shrink-0">
            <div
              onClick={() => imageInputRef.current?.click()}
              className={`w-full h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition ${
                uploadedImage ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/10 hover:border-white/20'
              }`}
            >
              {uploadedImage ? (
                <img src={uploadedImage} alt="Uploaded" className="max-h-20 max-w-full object-contain rounded" />
              ) : (
                <>
                  <span className="text-xl mb-1">📸</span>
                  <span className="text-xs text-zinc-400">Upload hero image</span>
                  <span className="text-xs text-zinc-600 mt-0.5">JPG · PNG · WEBP</span>
                </>
              )}
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

            <button
              onClick={generateLayouts}
              disabled={!uploadedImage || selectedSets.length === 0 || isGenerating}
              className={`w-full py-3 rounded-lg text-sm font-semibold transition ${
                uploadedImage && selectedSets.length > 0 && !isGenerating
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating…
                </span>
              ) : `Generate ${totalSpecs > 0 ? `${totalSpecs} sizes` : 'Ads'}`}
            </button>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Platform Tabs */}
          {selectedSets.length > 0 && (
            <div className="flex items-center gap-1 px-4 py-2.5 border-b border-white/5 overflow-x-auto flex-shrink-0">
              {SPEC_SETS.filter(s => selectedSets.includes(s.id)).map(set => (
                <button
                  key={set.id}
                  onClick={() => setActiveTab(set.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                    activeTab === set.id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeTab === set.id ? set.color : '#555' }} />
                  {set.label}
                  <span className="text-zinc-600">({set.specs.length})</span>
                </button>
              ))}
            </div>
          )}

          {/* Canvas Grid */}
          <div className="flex-1 overflow-auto p-6 bg-zinc-950">
            {selectedSets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h2 className="text-base font-semibold text-zinc-300 mb-2">Select platforms to begin</h2>
                <p className="text-sm text-zinc-500 max-w-xs">Go to the Platforms tab and choose where your ads will run.</p>
              </div>
            ) : Object.keys(layouts).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-5xl mb-4">🌱</div>
                <h2 className="text-base font-semibold text-zinc-300 mb-2">Ready to seed</h2>
                <p className="text-sm text-zinc-500 max-w-sm">
                  {uploadedImage
                    ? `${totalSpecs} sizes across ${selectedSets.length} platform${selectedSets.length !== 1 ? 's' : ''} ready. Hit Generate.`
                    : 'Upload a hero image in the panel, then hit Generate.'}
                </p>
              </div>
            ) : (
              <div>
                {activeSpecSet && (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: activeSpecSet.color }} />
                      <h2 className="text-sm font-medium text-zinc-300">{activeSpecSet.platform}</h2>
                      <span className="text-xs text-zinc-600">{activeSpecSet.specs.length} sizes</span>
                    </div>
                    <div className="flex flex-wrap gap-6 items-start">
                      {activeSpecSet.specs.map(spec => (
                        <AdCanvas
                          key={spec.id}
                          spec={spec}
                          imageUrl={uploadedImage}
                          logoUrl={brandKit.logoUrl}
                          brandKit={brandKit}
                          copySet={copySet}
                          layout={layouts[spec.id] || []}
                          onExport={handleExport}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

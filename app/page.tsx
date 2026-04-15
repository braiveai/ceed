'use client'

import { useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import BrandKitPanel from '@/components/ui/BrandKitPanel'
import CopyPanel from '@/components/ui/CopyPanel'
import SpecSelector from '@/components/ui/SpecSelector'
import StylePanel from '@/components/ui/StylePanel'
import { SPEC_SETS } from '@/lib/specs'
import { generateLayout } from '@/lib/fallbackLayout'
import { BrandKit, CopySet, ElementPlacement, ElementOverride, ImageAnalysis, StyleDefaults } from '@/types'

const AdCanvas = dynamic(() => import('@/components/canvas/AdCanvas'), { ssr: false })

const DEFAULT_BRAND: BrandKit = {
  logoUrl: null, primaryColor: '#FF4438', secondaryColor: '#1a1a2e',
  fontFamily: 'Montserrat', companyName: '',
}
const DEFAULT_COPY: CopySet = {
  headline: 'Your Headline Here',
  subHeadline: 'Supporting message that reinforces your offer',
  ctaText: 'Learn More', bodyText: '',
}
const DEFAULT_STYLE: StyleDefaults = {
  fontSizeScale: 1, overlayOpacity: 0.5,
  overlayPosition: 'auto', textColor: '#ffffff', overlayColor: '#000000',
}

type SidebarTab = 'brand' | 'copy' | 'style' | 'specs'

export default function Home() {
  const [brandKit, setBrandKit] = useState<BrandKit>(DEFAULT_BRAND)
  const [copySet, setCopySet] = useState<CopySet>(DEFAULT_COPY)
  const [styleDefaults, setStyleDefaults] = useState<StyleDefaults>(DEFAULT_STYLE)
  const [selectedSets, setSelectedSets] = useState<string[]>(['meta'])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null)
  const [uploadedMediaType, setUploadedMediaType] = useState<string>('image/jpeg')
  const [layouts, setLayouts] = useState<Record<string, ElementPlacement[]>>({})
  const [overrides, setOverrides] = useState<Record<string, Record<number, ElementOverride>>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('meta')
  const [generatedDataUrls, setGeneratedDataUrls] = useState<Record<string, string>>({})
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('brand')
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analysing' | 'done' | 'failed'>('idle')
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedMediaType(file.type)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setUploadedImage(dataUrl)
      setUploadedImageBase64(dataUrl.split(',')[1])
    }
    reader.readAsDataURL(file)
  }

  const handleOverrideChange = useCallback((specId: string, index: number, override: ElementOverride) => {
    setOverrides(prev => ({ ...prev, [specId]: { ...(prev[specId] || {}), [index]: override } }))
  }, [])

  const generateLayouts = useCallback(async () => {
    if (!uploadedImage) return
    setIsGenerating(true)
    setAnalysisStatus('analysing')

    let analysis: ImageAnalysis = {
      subjectPosition: 'center', safeZone: 'bottom',
      brightness: 'dark', textColor: '#ffffff', dominantBgColor: '#000000'
    }

    if (uploadedImageBase64) {
      try {
        const res = await fetch('/api/analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: uploadedImageBase64, mediaType: uploadedMediaType }),
        })
        if (res.ok) {
          const { analysis: a } = await res.json()
          analysis = a
          setAnalysisStatus('done')
        } else {
          setAnalysisStatus('failed')
        }
      } catch {
        setAnalysisStatus('failed')
      }
    }

    const allSpecs = SPEC_SETS.filter(s => selectedSets.includes(s.id)).flatMap(s => s.specs)
    const newLayouts: Record<string, ElementPlacement[]> = {}
    for (const spec of allSpecs) {
      newLayouts[spec.id] = generateLayout(spec, copySet, brandKit, analysis, styleDefaults)
    }

    setLayouts(newLayouts)
    setOverrides({})
    setIsGenerating(false)
  }, [uploadedImage, uploadedImageBase64, uploadedMediaType, selectedSets, copySet, brandKit, styleDefaults])

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
      folder?.file(`${spec.platform.replace(/[^a-z0-9]/gi, '-')}-${spec.name.replace(/[^a-z0-9]/gi, '-')}-${spec.width}x${spec.height}.png`, base64, { base64: true })
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'ceed-ad-set.zip')
  }

  const activeSpecSet = SPEC_SETS.find(s => s.id === activeTab)
  const totalSpecs = SPEC_SETS.filter(s => selectedSets.includes(s.id)).reduce((a, s) => a + s.specs.length, 0)
  const generatedCount = Object.keys(generatedDataUrls).length
  const hasLayouts = Object.keys(layouts).length > 0

  const SIDEBAR_TABS: { id: SidebarTab; label: string }[] = [
    { id: 'brand', label: 'Brand' },
    { id: 'copy', label: 'Copy' },
    { id: 'style', label: 'Style' },
    { id: 'specs', label: 'Platforms' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <header className="border-b border-white/5 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xs font-bold">C</div>
          <div className="flex items-baseline gap-2">
            <span className="text-white font-semibold text-sm tracking-tight">Ceed</span>
            <span className="text-zinc-500 text-xs">by BRAIVE</span>
          </div>
          {analysisStatus === 'done' && (
            <span className="text-xs text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> AI analysed
            </span>
          )}
          {analysisStatus === 'failed' && (
            <span className="text-xs text-zinc-500">Using smart layout</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {generatedCount > 0 && <span className="text-xs text-zinc-500">{generatedCount} / {totalSpecs} exported</span>}
          {generatedCount > 0 && (
            <button onClick={exportAll}
              className="px-4 py-2 rounded-lg bg-white text-zinc-900 text-xs font-semibold hover:bg-zinc-100 transition">
              ↓ Download Zip ({generatedCount})
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="border-r border-white/5 flex flex-col overflow-hidden flex-shrink-0" style={{ width: 272 }}>
          <div className="flex border-b border-white/5 flex-shrink-0">
            {SIDEBAR_TABS.map(tab => (
              <button key={tab.id} onClick={() => setSidebarTab(tab.id)}
                className={`flex-1 py-2.5 text-xs font-medium transition ${sidebarTab === tab.id ? 'text-white border-b-2 border-orange-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {sidebarTab === 'brand' && <BrandKitPanel brandKit={brandKit} onChange={setBrandKit} />}
            {sidebarTab === 'copy' && <CopyPanel copySet={copySet} onChange={setCopySet} />}
            {sidebarTab === 'style' && <StylePanel style={styleDefaults} onChange={setStyleDefaults} />}
            {sidebarTab === 'specs' && <SpecSelector selected={selectedSets} onChange={setSelectedSets} />}
          </div>

          <div className="p-4 border-t border-white/5 space-y-3 flex-shrink-0">
            <div onClick={() => imageInputRef.current?.click()}
              className={`w-full h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition ${uploadedImage ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/10 hover:border-white/20'}`}>
              {uploadedImage
                ? <img src={uploadedImage} alt="Uploaded" className="max-h-20 max-w-full object-contain rounded" />
                : (<><span className="text-xl mb-1">📸</span><span className="text-xs text-zinc-400">Upload hero image</span><span className="text-xs text-zinc-600 mt-0.5">JPG · PNG · WEBP</span></>)}
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

            <button onClick={generateLayouts}
              disabled={!uploadedImage || selectedSets.length === 0 || isGenerating}
              className={`w-full py-3 rounded-lg text-sm font-semibold transition ${uploadedImage && selectedSets.length > 0 && !isGenerating ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}>
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {analysisStatus === 'analysing' ? 'Analysing image…' : 'Generating…'}
                </span>
              ) : `Generate ${totalSpecs > 0 ? `${totalSpecs} sizes` : 'Ads'}`}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedSets.length > 0 && (
            <div className="flex items-center gap-1 px-4 py-2.5 border-b border-white/5 overflow-x-auto flex-shrink-0">
              {SPEC_SETS.filter(s => selectedSets.includes(s.id)).map(set => (
                <button key={set.id} onClick={() => setActiveTab(set.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${activeTab === set.id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'}`}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeTab === set.id ? set.color : '#555' }} />
                  {set.label}
                  <span className="text-zinc-600">({set.specs.length})</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-auto p-6 bg-zinc-950">
            {!hasLayouts ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-5xl mb-4">{selectedSets.length === 0 ? '🎯' : '🌱'}</div>
                <h2 className="text-base font-semibold text-zinc-300 mb-2">
                  {selectedSets.length === 0 ? 'Select platforms to begin' : 'Ready to seed'}
                </h2>
                <p className="text-sm text-zinc-500 max-w-sm">
                  {selectedSets.length === 0
                    ? 'Go to the Platforms tab and choose where your ads will run.'
                    : uploadedImage
                      ? `${totalSpecs} sizes across ${selectedSets.length} platform${selectedSets.length !== 1 ? 's' : ''}. Hit Generate.`
                      : 'Upload a hero image, then hit Generate.'}
                </p>
              </div>
            ) : activeSpecSet && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: activeSpecSet.color }} />
                  <h2 className="text-sm font-medium text-zinc-300">{activeSpecSet.platform}</h2>
                  <span className="text-xs text-zinc-600">{activeSpecSet.specs.length} sizes</span>
                  <span className="text-xs text-zinc-600">· Click any element to edit</span>
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
                      overrides={overrides[spec.id] || {}}
                      onOverrideChange={handleOverrideChange}
                      onExport={handleExport}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

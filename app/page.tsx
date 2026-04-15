'use client'

import { useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import BrandKitPanel from '@/components/ui/BrandKitPanel'
import CopyPanel from '@/components/ui/CopyPanel'
import SpecSelector from '@/components/ui/SpecSelector'
import StylePanel from '@/components/ui/StylePanel'
import PropertiesPanel from '@/components/ui/PropertiesPanel'
import InSituPreview from '@/components/ui/InSituPreview'
import { SPEC_SETS } from '@/lib/specs'
import { generateLayout } from '@/lib/fallbackLayout'
import { BrandKit, CopySet, ElementPlacement, ElementOverride, ImageAnalysis, StyleDefaults } from '@/types'

const AdCanvas = dynamic(() => import('@/components/canvas/AdCanvas'), { ssr: false })

const DEFAULT_BRAND: BrandKit = { logoUrl: null, primaryColor: '#2563EB', secondaryColor: '#1a1a2e', fontFamily: 'Montserrat', companyName: '' }
const DEFAULT_COPY: CopySet = { headline: 'Your Headline Here', subHeadline: 'Supporting message that reinforces your offer', ctaText: 'Learn More', bodyText: '' }
const DEFAULT_STYLE: StyleDefaults = { fontSizeScale: 1, overlayOpacity: 0.5, overlayPosition: 'auto', textColor: '#ffffff', overlayColor: '#000000' }
const DEFAULT_ANALYSIS: ImageAnalysis = { subjectPosition: 'center', safeZone: 'bottom', brightness: 'dark', textColor: '#ffffff', dominantBgColor: '#000000', suggestedCtaColor: '#2563EB' }

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
  const [locked, setLocked] = useState<Record<string, Record<number, boolean>>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('meta')
  const [exportedDataUrls, setExportedDataUrls] = useState<Record<string, string>>({})
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('brand')
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analysing' | 'done' | 'failed'>('idle')
  const [lastAnalysis, setLastAnalysis] = useState<ImageAnalysis>(DEFAULT_ANALYSIS)
  const [isExportingAll, setIsExportingAll] = useState(false)
  const [selectedEl, setSelectedEl] = useState<{ specId: string; index: number } | null>(null)
  const [previewPlatformId, setPreviewPlatformId] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedMediaType(file.type)
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      setUploadedImage(dataUrl)
      setUploadedImageBase64(dataUrl.split(',')[1])
    }
    reader.readAsDataURL(file)
  }

  const runAnalysis = useCallback(async (): Promise<ImageAnalysis> => {
    if (!uploadedImageBase64) return DEFAULT_ANALYSIS
    setAnalysisStatus('analysing')
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: uploadedImageBase64, mediaType: uploadedMediaType }),
      })
      if (res.ok) {
        const { analysis } = await res.json()
        setLastAnalysis(analysis)
        setAnalysisStatus('done')
        // Auto-apply AI suggested CTA colour
        if (analysis.suggestedCtaColor) {
          setBrandKit(prev => ({ ...prev, primaryColor: analysis.suggestedCtaColor }))
        }
        return analysis
      }
    } catch {}
    setAnalysisStatus('failed')
    return DEFAULT_ANALYSIS
  }, [uploadedImageBase64, uploadedMediaType])

  const generateForSpecs = useCallback((specIds: string[], analysis: ImageAnalysis) => {
    const allSpecs = SPEC_SETS.flatMap(s => s.specs)
    const newLayouts: Record<string, ElementPlacement[]> = {}
    for (const id of specIds) {
      const spec = allSpecs.find(s => s.id === id)
      if (spec) newLayouts[id] = generateLayout(spec, copySet, brandKit, analysis, styleDefaults)
    }
    return newLayouts
  }, [copySet, brandKit, styleDefaults])

  const generateLayouts = useCallback(async () => {
    if (!uploadedImage) return
    setIsGenerating(true)
    setSelectedEl(null)
    const analysis = await runAnalysis()
    const allSpecIds = SPEC_SETS.filter(s => selectedSets.includes(s.id)).flatMap(s => s.specs.map(sp => sp.id))
    const newLayouts = generateForSpecs(allSpecIds, analysis)
    setLayouts(newLayouts)
    setOverrides({})
    setLocked({})
    setIsGenerating(false)
  }, [uploadedImage, selectedSets, runAnalysis, generateForSpecs])

  const handleSetsChange = useCallback((newSets: string[]) => {
    setSelectedSets(newSets)
    if (Object.keys(layouts).length === 0) return
    const addedSets = newSets.filter(id => !selectedSets.includes(id))
    if (addedSets.length === 0) return
    const newSpecIds = SPEC_SETS.filter(s => addedSets.includes(s.id)).flatMap(s => s.specs.map(sp => sp.id))
    setLayouts(prev => ({ ...prev, ...generateForSpecs(newSpecIds, lastAnalysis) }))
    setActiveTab(addedSets[0])
  }, [selectedSets, layouts, lastAnalysis, generateForSpecs])

  const handleRegenerate = useCallback(async (specId: string) => {
    const spec = SPEC_SETS.flatMap(s => s.specs).find(s => s.id === specId)
    if (!spec) return
    setLayouts(prev => ({ ...prev, [specId]: generateLayout(spec, copySet, brandKit, lastAnalysis, styleDefaults) }))
    setOverrides(prev => { const n = { ...prev }; delete n[specId]; return n })
  }, [copySet, brandKit, lastAnalysis, styleDefaults])

  const handleAutoExport = useCallback((dataUrl: string, specId: string) => {
    setExportedDataUrls(prev => ({ ...prev, [specId]: dataUrl }))
  }, [])

  const handleElementSelect = useCallback((specId: string, index: number) => {
    setSelectedEl({ specId, index })
  }, [])

  const handleOverrideChange = useCallback((specId: string, index: number, override: ElementOverride) => {
    setOverrides(prev => ({ ...prev, [specId]: { ...(prev[specId] || {}), [index]: override } }))
  }, [])

  const handleLockToggle = useCallback((specId: string, index: number) => {
    setLocked(prev => ({ ...prev, [specId]: { ...(prev[specId] || {}), [index]: !prev[specId]?.[index] } }))
  }, [])

  const exportAllZip = async () => {
    setIsExportingAll(true)
    try {
      const { exportSpecToDataUrl } = await import('@/lib/exportCanvas')
      const JSZip = (await import('jszip')).default
      const { saveAs } = await import('file-saver')
      const zip = new JSZip()
      const allSpecs = SPEC_SETS.filter(s => selectedSets.includes(s.id)).flatMap(s => s.specs)
      for (const spec of allSpecs) {
        const layout = layouts[spec.id]
        if (!layout) continue
        try {
          const dataUrl = await exportSpecToDataUrl(spec, uploadedImage, brandKit.logoUrl, brandKit, copySet, layout, overrides[spec.id] || {})
          const b64 = dataUrl.replace('data:image/png;base64,', '')
          const platform = spec.platform.replace(/[^a-z0-9]/gi, '-')
          const name = spec.name.replace(/[^a-z0-9]/gi, '-')
          zip.folder(platform)?.file(`${name}-${spec.width}x${spec.height}.png`, b64, { base64: true })
        } catch {}
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      saveAs(blob, `ceed-${(brandKit.companyName || 'ads').replace(/\s+/g, '-').toLowerCase()}.zip`)
    } catch (e) { console.error(e) }
    setIsExportingAll(false)
  }

  const activeSpecSet = SPEC_SETS.find(s => s.id === activeTab)
  const totalSpecs = SPEC_SETS.filter(s => selectedSets.includes(s.id)).reduce((a, s) => a + s.specs.length, 0)
  const hasLayouts = Object.keys(layouts).length > 0

  // Derive selected element data for properties panel
  const selectedElData = selectedEl ? layouts[selectedEl.specId]?.[selectedEl.index] : null
  const selectedElOverride = selectedEl ? (overrides[selectedEl.specId]?.[selectedEl.index] || {}) : {}
  const selectedElLocked = selectedEl ? (locked[selectedEl.specId]?.[selectedEl.index] || false) : false

  const TABS: { id: SidebarTab; label: string }[] = [
    { id: 'brand', label: 'Brand' }, { id: 'copy', label: 'Copy' },
    { id: 'style', label: 'Style' }, { id: 'specs', label: 'Platforms' }
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <header className="border-b border-white/5 px-5 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xs font-bold">C</div>
          <div className="flex items-baseline gap-2">
            <span className="text-white font-semibold text-sm">Ceed</span>
            <span className="text-zinc-500 text-xs">by BRAIVE</span>
          </div>
          {analysisStatus === 'done' && <span className="text-xs text-emerald-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />AI analysed</span>}
          {analysisStatus === 'failed' && <span className="text-xs text-zinc-600">Smart layout</span>}
        </div>
        <div className="flex items-center gap-2">
          {hasLayouts && (
            <button onClick={exportAllZip} disabled={isExportingAll}
              className="px-4 py-2 rounded-lg bg-white text-zinc-900 text-xs font-semibold hover:bg-zinc-100 transition disabled:opacity-50 flex items-center gap-2">
              {isExportingAll ? <><span className="w-3 h-3 border border-zinc-400 border-t-zinc-800 rounded-full animate-spin" />Exporting…</> : `↓ Export All (${totalSpecs})`}
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="border-r border-white/5 flex flex-col overflow-hidden flex-shrink-0" style={{ width: 272 }}>
          <div className="flex border-b border-white/5 flex-shrink-0">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setSidebarTab(t.id)}
                className={`flex-1 py-2.5 text-xs font-medium transition ${sidebarTab === t.id ? 'text-white border-b-2 border-orange-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {sidebarTab === 'brand' && <BrandKitPanel brandKit={brandKit} onChange={setBrandKit} />}
            {sidebarTab === 'copy' && <CopyPanel copySet={copySet} companyName={brandKit.companyName} onChange={setCopySet} />}
            {sidebarTab === 'style' && <StylePanel style={styleDefaults} onChange={setStyleDefaults} />}
            {sidebarTab === 'specs' && <SpecSelector selected={selectedSets} onChange={handleSetsChange} />}
          </div>
          <div className="p-4 border-t border-white/5 space-y-3 flex-shrink-0">
            <div onClick={() => imageInputRef.current?.click()}
              className={`w-full h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition ${uploadedImage ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/10 hover:border-white/20'}`}>
              {uploadedImage
                ? <img src={uploadedImage} alt="Uploaded" className="max-h-20 max-w-full object-contain rounded" />
                : <><span className="text-xl mb-1">📸</span><span className="text-xs text-zinc-400">Upload hero image</span><span className="text-xs text-zinc-600 mt-0.5">JPG · PNG · WEBP</span></>}
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <button onClick={generateLayouts} disabled={!uploadedImage || selectedSets.length === 0 || isGenerating}
              className={`w-full py-3 rounded-lg text-sm font-semibold transition ${uploadedImage && selectedSets.length > 0 && !isGenerating ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}>
              {isGenerating
                ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{analysisStatus === 'analysing' ? 'Analysing image…' : 'Generating…'}</span>
                : `Generate ${totalSpecs > 0 ? `${totalSpecs} sizes` : 'Ads'}`}
            </button>
          </div>
        </div>

        {/* Main canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Platform tabs */}
          {selectedSets.length > 0 && (
            <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 overflow-x-auto flex-shrink-0">
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

          <div className="flex flex-1 overflow-hidden">
            {/* Canvas grid */}
            <div className="flex-1 overflow-auto p-6 bg-zinc-950" onClick={() => setSelectedEl(null)}>
              {!hasLayouts ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="text-5xl mb-4">{selectedSets.length === 0 ? '🎯' : '🌱'}</div>
                  <h2 className="text-base font-semibold text-zinc-300 mb-2">{selectedSets.length === 0 ? 'Select platforms to begin' : 'Ready to seed'}</h2>
                  <p className="text-sm text-zinc-500 max-w-sm">
                    {selectedSets.length === 0 ? 'Choose platforms from the Platforms tab.'
                      : uploadedImage ? `${totalSpecs} sizes ready. Hit Generate.`
                      : 'Upload a hero image, then hit Generate.'}
                  </p>
                </div>
              ) : activeSpecSet && (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: activeSpecSet.color }} />
                    <h2 className="text-sm font-medium text-zinc-300">{activeSpecSet.platform}</h2>
                    <span className="text-xs text-zinc-600">{activeSpecSet.specs.length} sizes</span>
                    <span className="text-xs text-zinc-700">· click element to edit</span>
                    <div className="ml-auto">
                      <button onClick={() => setPreviewPlatformId(activeTab)}
                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 text-zinc-300 transition flex items-center gap-1.5">
                        👁 Preview in feed
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-5 items-start">
                    {activeSpecSet.specs.map(spec => (
                      <AdCanvas
                        key={spec.id} spec={spec} imageUrl={uploadedImage} logoUrl={brandKit.logoUrl}
                        brandKit={brandKit} copySet={copySet} layout={layouts[spec.id] || []}
                        overrides={overrides[spec.id] || {}} locked={locked[spec.id] || {}}
                        selectedIndex={selectedEl?.specId === spec.id ? selectedEl.index : null}
                        onElementSelect={handleElementSelect} onDeselect={() => setSelectedEl(null)}
                        onLockToggle={handleLockToggle} onRegenerate={handleRegenerate}
                        onAutoExport={handleAutoExport}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Properties panel — slides in when element selected */}
            {selectedElData && selectedEl && (
              <PropertiesPanel
                element={selectedElData} override={selectedElOverride}
                locked={selectedElLocked} brandKit={brandKit}
                specId={selectedEl.specId} elementIndex={selectedEl.index}
                onChange={handleOverrideChange} onLockToggle={handleLockToggle}
                onClose={() => setSelectedEl(null)}
              />
            )}
          </div>
        </div>
      </div>

      {/* In-situ preview modal */}
      {previewPlatformId && activeSpecSet && (
        <InSituPreview
          specs={activeSpecSet.specs}
          dataUrls={exportedDataUrls}
          platformId={previewPlatformId}
          onClose={() => setPreviewPlatformId(null)}
        />
      )}
    </div>
  )
}

'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { SPEC_SETS } from '@/lib/specs'
import { PLATFORM_CATEGORIES, getSpecsForCategory } from '@/lib/categories'
import { generateLayout, generateLogoLayout, LOGO_ONLY_SPECS } from '@/lib/fallbackLayout'
import { TEMPLATES } from '@/lib/layoutTemplates'
import { BrandKit, CopySet, ElementPlacement, ElementOverride, ImageAnalysis, StyleDefaults, CopyVariant } from '@/types'

const AdCanvas = dynamic(() => import('@/components/canvas/AdCanvas'), { ssr: false })
const FloatingProperties = dynamic(() => import('@/components/ui/FloatingProperties'), { ssr: false })
const InSituPreview = dynamic(() => import('@/components/ui/InSituPreview'), { ssr: false })

const DEFAULT_BRAND: BrandKit = { logoUrl: null, primaryColor: '#5B6AF0', secondaryColor: '#0C0C0E', fontFamily: 'Montserrat', companyName: '' }
const DEFAULT_COPY: CopySet = { headline: 'Your Headline Here', subHeadline: 'Supporting message that reinforces your offer', ctaText: 'Learn More' }
const DEFAULT_STYLE: StyleDefaults = { fontSizeScale: 1, overlayOpacity: 0.55, overlayPosition: 'auto', textColor: '#ffffff', overlayColor: '#000000', template: 'auto' }
const DEFAULT_ANALYSIS: ImageAnalysis = { subjectPosition: 'center', safeZone: 'bottom', brightness: 'dark', textColor: '#ffffff', dominantBgColor: '#000000' }
const GOOGLE_FONTS = ['Montserrat','Inter','Poppins','Lato','Raleway','Oswald','Merriweather','Playfair Display','Nunito','Work Sans','DM Sans','Outfit','Barlow','Plus Jakarta Sans']

type SidebarTab = 'campaign' | 'brand' | 'platforms'

export default function Home() {
  const [brandKit, setBrandKit] = useState<BrandKit>(DEFAULT_BRAND)
  const [copySet, setCopySet] = useState<CopySet>(DEFAULT_COPY)
  const [activeCopyVariant, setActiveCopyVariant] = useState<number | null>(null)
  const [copyVariants, setCopyVariants] = useState<CopyVariant[]>([])
  const [styleDefaults, setStyleDefaults] = useState<StyleDefaults>(DEFAULT_STYLE)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(['social'])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null)
  const [uploadedMediaType, setUploadedMediaType] = useState('image/jpeg')
  const [layouts, setLayouts] = useState<Record<string, ElementPlacement[]>>({})
  const [overrides, setOverrides] = useState<Record<string, Record<number, ElementOverride>>>({})
  const [locked, setLocked] = useState<Record<string, Record<number, boolean>>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeCategory, setActiveCategory] = useState('social')
  const [activePlatform, setActivePlatform] = useState<string | null>(null)
  const [exportedUrls, setExportedUrls] = useState<Record<string, string>>({})
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('campaign')
  const [analysisStatus, setAnalysisStatus] = useState<'idle'|'analysing'|'done'|'failed'>('idle')
  const [lastAnalysis, setLastAnalysis] = useState<ImageAnalysis>(DEFAULT_ANALYSIS)
  const [ctaSuggestion, setCtaSuggestion] = useState<string | null>(null)
  const [selectedEl, setSelectedEl] = useState<{ specId: string; index: number; x: number; y: number } | null>(null)
  const [previewSetId, setPreviewSetId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [showExportSummary, setShowExportSummary] = useState(false)
  const [showSafeZones, setShowSafeZones] = useState(false)
  const [undoStack, setUndoStack] = useState<Array<Record<string, Record<number, ElementOverride>>>>([])
  const scrollPositions = useRef<Record<string, number>>({})
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false)
  const [variantOffer, setVariantOffer] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const generateDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Selected platform set for preview
  const activePlatformSet = activePlatform ? SPEC_SETS.find(s => s.id === activePlatform) : null

  // All selected spec IDs
  const allSelectedSpecIds = PLATFORM_CATEGORIES
    .filter(c => selectedCategoryIds.includes(c.id))
    .flatMap(c => getSpecsForCategory(c.id))
    .flatMap(s => s.specs.map(sp => sp.id))

  const totalSpecs = allSelectedSpecIds.length
  const hasLayouts = Object.keys(layouts).length > 0

  const effectiveCopy = useMemo(() => activeCopyVariant !== null && copyVariants[activeCopyVariant]
    ? { ...copySet, headline: copyVariants[activeCopyVariant].headline, subHeadline: copyVariants[activeCopyVariant].subHeadline, ctaText: copyVariants[activeCopyVariant].ctaText }
    : copySet
  , [activeCopyVariant, copyVariants, copySet])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedMediaType(file.type)
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      setUploadedImage(dataUrl)
      setUploadedBase64(dataUrl.split(',')[1])
    }
    reader.readAsDataURL(file)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setBrandKit(prev => ({ ...prev, logoUrl: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const runAnalysis = useCallback(async (): Promise<ImageAnalysis> => {
    if (!uploadedBase64) return DEFAULT_ANALYSIS
    setAnalysisStatus('analysing')
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: uploadedBase64, mediaType: uploadedMediaType }),
      })
      if (res.ok) {
        const { analysis } = await res.json()
        setLastAnalysis(analysis)
        setAnalysisStatus('done')
        if (analysis.suggestedCtaColor) setCtaSuggestion(analysis.suggestedCtaColor)
        return analysis
      }
    } catch {}
    setAnalysisStatus('failed')
    return DEFAULT_ANALYSIS
  }, [uploadedBase64, uploadedMediaType])

  const buildLayout = useCallback((specId: string, copy: CopySet, brand: BrandKit, analysis: ImageAnalysis, style: StyleDefaults) => {
    const spec = SPEC_SETS.flatMap(s => s.specs).find(s => s.id === specId)
    if (!spec) return []
    if (LOGO_ONLY_SPECS.includes(specId)) return generateLogoLayout(spec, brand, style)
    return generateLayout(spec, copy, brand, analysis, style)
  }, [])

  const generateAll = useCallback(async (customCopy?: CopySet) => {
    if (!uploadedImage || allSelectedSpecIds.length === 0) return
    setIsGenerating(true)
    setSelectedEl(null)
    setCtaSuggestion(null)
    const analysis = await runAnalysis()
    const copy = customCopy || effectiveCopy
    const newLayouts: Record<string, ElementPlacement[]> = {}
    for (const id of allSelectedSpecIds) newLayouts[id] = buildLayout(id, copy, brandKit, analysis, styleDefaults)
    setLayouts(newLayouts)
    setOverrides({})
    setLocked({})
    setIsGenerating(false)
  }, [uploadedImage, allSelectedSpecIds, runAnalysis, effectiveCopy, brandKit, styleDefaults, buildLayout])

  // Auto-generate when image uploaded — intentionally only triggers on image change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!uploadedImage || allSelectedSpecIds.length === 0) return
    if (generateDebounce.current) clearTimeout(generateDebounce.current)
    generateDebounce.current = setTimeout(() => generateAll(), 300)
    return () => { if (generateDebounce.current) clearTimeout(generateDebounce.current) }
  }, [uploadedImage]) // only trigger on image change, not every dep change

  const handleApplyToAll = useCallback((elementIndex: number, override: ElementOverride) => {
    setOverrides(prev => {
      const updated = { ...prev }
      for (const specId of Object.keys(layouts)) {
        updated[specId] = { ...(updated[specId] || {}), [elementIndex]: override }
      }
      return updated
    })
  }, [layouts])

  const handleElementSelect = useCallback((specId: string, index: number, screenX: number, screenY: number) => {
    setSelectedEl(prev => prev?.specId === specId && prev?.index === index ? null : { specId, index, x: screenX, y: screenY })
  }, [])

  const handleOverrideChange = useCallback((specId: string, index: number, override: ElementOverride) => {
    setOverrides(prev => {
      setUndoStack(stack => [...stack.slice(-19), prev])
      return { ...prev, [specId]: { ...(prev[specId] || {}), [index]: override } }
    })
  }, [])

  const handleReset = useCallback((specId: string) => {
    setOverrides(prev => { const n = { ...prev }; delete n[specId]; return n })
  }, [])

  const handleUndo = useCallback(() => {
    setUndoStack(stack => {
      if (stack.length === 0) return stack
      const prev = stack[stack.length - 1]
      setOverrides(prev)
      return stack.slice(0, -1)
    })
  }, [])

  const handleLockToggle = useCallback((specId: string, index: number) => {
    setLocked(prev => ({ ...prev, [specId]: { ...(prev[specId] || {}), [index]: !prev[specId]?.[index] } }))
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey
      if (isMeta && e.key === 'z') { e.preventDefault(); handleUndo() }
      if (e.key === 'Escape') setSelectedEl(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleUndo])

  const handleRegenerate = useCallback(async (specId: string) => {
    const spec = SPEC_SETS.flatMap(s => s.specs).find(s => s.id === specId)
    if (!spec) return
    setLayouts(prev => ({ ...prev, [specId]: buildLayout(specId, effectiveCopy, brandKit, lastAnalysis, styleDefaults) }))
    setOverrides(prev => { const n = { ...prev }; delete n[specId]; return n })
  }, [effectiveCopy, brandKit, lastAnalysis, styleDefaults, buildLayout])

  const handleAutoExport = useCallback((dataUrl: string, specId: string) => {
    setExportedUrls(prev => ({ ...prev, [specId]: dataUrl }))
  }, [])

  const generateVariants = async () => {
    setIsGeneratingVariants(true)
    try {
      const res = await fetch('/api/copyVariants', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: brandKit.companyName, industry: variantOffer }),
      })
      if (res.ok) {
        const { variants } = await res.json()
        setCopyVariants(variants.map((v: any, i: number) => ({ ...v, label: ['A','B','C'][i] })))
      }
    } catch {}
    setIsGeneratingVariants(false)
  }

  const exportAllZip = async () => {
    setIsExporting(true)
    try {
      const { exportSpecToDataUrl } = await import('@/lib/exportCanvas')
      const JSZip = (await import('jszip')).default
      const { saveAs } = await import('file-saver')
      const zip = new JSZip()
      const allSpecs = SPEC_SETS.filter(s => allSelectedSpecIds.includes(s.specs[0]?.id || '')).flatMap(s => s.specs)
        .concat(SPEC_SETS.flatMap(s => s.specs).filter(s => allSelectedSpecIds.includes(s.id)))
        .filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i)

      for (const spec of allSpecs) {
        const layout = layouts[spec.id]
        if (!layout) continue
        try {
          const dataUrl = await exportSpecToDataUrl(spec, uploadedImage, brandKit.logoUrl, brandKit, effectiveCopy, layout, overrides[spec.id] || {})
          zip.folder(spec.platform.replace(/[^a-z0-9]/gi, '-'))?.file(`${spec.name.replace(/[^a-z0-9]/gi, '-')}-${spec.width}x${spec.height}.png`, dataUrl.replace('data:image/png;base64,', ''), { base64: true })
        } catch {}
      }
      saveAs(await zip.generateAsync({ type: 'blob' }), `ceed-${(brandKit.companyName || 'ads').replace(/\s+/g,'-').toLowerCase()}.zip`)
      setShowExportSummary(false)
    } catch {}
    setIsExporting(false)
  }

  // Active category's platforms
  const activeCategoryData = PLATFORM_CATEGORIES.find(c => c.id === activeCategory)
  const activeCategoryPlatforms = activeCategoryData ? getSpecsForCategory(activeCategory) : []
  const displayedPlatform = activePlatform
    ? SPEC_SETS.find(s => s.id === activePlatform)
    : activeCategoryPlatforms[0] || null

  const TABS: { id: SidebarTab; label: string }[] = [
    { id: 'campaign', label: 'Campaign' },
    { id: 'brand', label: 'Brand' },
    { id: 'platforms', label: 'Platforms' },
  ]

  const selectedElData = selectedEl ? layouts[selectedEl.specId]?.[selectedEl.index] : null

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--braive-bg)', color: 'var(--braive-text)', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--braive-border)', backgroundColor: 'var(--braive-surface)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--braive-accent)' }}>C</div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm" style={{ color: 'var(--braive-text)' }}>Ceed</span>
            <span className="text-xs" style={{ color: 'var(--braive-muted)' }}>by BRAIVE</span>
          </div>
          {analysisStatus === 'done' && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#10B981' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />AI analysed
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {undoStack.length > 0 && (
            <button onClick={handleUndo} className="px-3 py-2 rounded-lg text-xs transition"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--braive-muted)' }}>
              ↩ Undo ({undoStack.length})
            </button>
          )}
          <button onClick={() => setShowSafeZones(p => !p)} className="px-3 py-2 rounded-lg text-xs transition"
            style={{ backgroundColor: showSafeZones ? 'rgba(255,200,0,0.15)' : 'rgba(255,255,255,0.06)', color: showSafeZones ? '#ffc800' : 'var(--braive-muted)', border: showSafeZones ? '1px solid rgba(255,200,0,0.3)' : '1px solid transparent' }}>
            {showSafeZones ? '⚠ Safe zones on' : 'Safe zones'}
          </button>
          {hasLayouts && (
            <button onClick={() => setShowExportSummary(true)}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition"
              style={{ backgroundColor: 'var(--braive-accent)', color: '#fff' }}>
              ↓ Export All ({totalSpecs})
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <div className="flex flex-col overflow-hidden flex-shrink-0" style={{ width: 264, borderRight: '1px solid var(--braive-border)', backgroundColor: 'var(--braive-surface)' }}>
          <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid var(--braive-border)' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setSidebarTab(t.id)}
                className="flex-1 py-2.5 text-xs font-medium transition"
                style={{ color: sidebarTab === t.id ? 'var(--braive-text)' : 'var(--braive-muted)', borderBottom: sidebarTab === t.id ? '2px solid var(--braive-accent)' : '2px solid transparent' }}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* CAMPAIGN TAB */}
            {sidebarTab === 'campaign' && (
              <>
                {/* Image upload */}
                <div>
                  <div className="text-xs font-medium mb-2" style={{ color: 'var(--braive-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hero Image</div>
                  <div onClick={() => imageInputRef.current?.click()}
                    className="w-full rounded-lg flex flex-col items-center justify-center cursor-pointer transition"
                    style={{ height: uploadedImage ? 'auto' : 80, border: `2px dashed ${uploadedImage ? 'rgba(91,106,240,0.4)' : 'rgba(255,255,255,0.1)'}`, backgroundColor: uploadedImage ? 'rgba(91,106,240,0.05)' : 'transparent', padding: uploadedImage ? 8 : 0 }}>
                    {uploadedImage
                      ? <img src={uploadedImage} alt="" className="max-h-24 max-w-full object-contain rounded" />
                      : <><span className="text-2xl mb-1">📸</span><span className="text-xs" style={{ color: 'var(--braive-muted)' }}>Upload image</span></>}
                  </div>
                  <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>

                {/* CTA suggestion */}
                {ctaSuggestion && (
                  <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(91,106,240,0.1)', border: '1px solid rgba(91,106,240,0.25)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: ctaSuggestion }} />
                      <span className="text-xs" style={{ color: 'var(--braive-muted)' }}>AI suggests CTA colour</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setBrandKit(p => ({ ...p, primaryColor: ctaSuggestion })); setCtaSuggestion(null) }}
                        className="text-xs px-2 py-0.5 rounded font-medium" style={{ backgroundColor: 'var(--braive-accent)', color: '#fff' }}>Apply</button>
                      <button onClick={() => setCtaSuggestion(null)} className="text-xs px-1" style={{ color: 'var(--braive-muted)' }}>✕</button>
                    </div>
                  </div>
                )}

                {/* Copy */}
                <div className="space-y-2.5">
                  <div className="text-xs font-medium" style={{ color: 'var(--braive-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Copy</div>
                  {[
                    { key: 'headline', label: 'Headline', max: 60, rows: 2 },
                    { key: 'subHeadline', label: 'Sub-headline', max: 90, rows: 2 },
                    { key: 'ctaText', label: 'CTA Button', max: 25, rows: 1 },
                  ].map(({ key, label, max, rows }) => (
                    <div key={key}>
                      <label className="text-xs block mb-1" style={{ color: 'var(--braive-muted)' }}>{label}</label>
                      {rows > 1 ? (
                        <textarea value={(copySet as any)[key]} onChange={e => setCopySet(p => ({ ...p, [key]: e.target.value }))}
                          maxLength={max} rows={rows}
                          className="w-full rounded px-2.5 py-2 text-sm resize-none focus:outline-none"
                          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--braive-text)' }} />
                      ) : (
                        <input type="text" value={(copySet as any)[key]} onChange={e => setCopySet(p => ({ ...p, [key]: e.target.value }))}
                          maxLength={max}
                          className="w-full rounded px-2.5 py-2 text-sm focus:outline-none"
                          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--braive-text)' }} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Copy variants as A/B/C tabs */}
                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--braive-border)' }}>
                  <div className="px-3 py-2 flex items-center justify-between" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-xs font-medium" style={{ color: 'var(--braive-text)' }}>✦ Copy Variants</span>
                    {activeCopyVariant !== null && (
                      <button onClick={() => setActiveCopyVariant(null)} className="text-xs" style={{ color: 'var(--braive-muted)' }}>Reset to main</button>
                    )}
                  </div>

                  {/* Variant tabs */}
                  {copyVariants.length > 0 && (
                    <div className="flex" style={{ borderBottom: '1px solid var(--braive-border)' }}>
                      <button onClick={() => setActiveCopyVariant(null)}
                        className="flex-1 py-1.5 text-xs transition"
                        style={{ color: activeCopyVariant === null ? 'var(--braive-text)' : 'var(--braive-muted)', borderBottom: activeCopyVariant === null ? '2px solid var(--braive-accent)' : '2px solid transparent' }}>
                        Main
                      </button>
                      {copyVariants.map((v, i) => (
                        <button key={i} onClick={() => setActiveCopyVariant(i)}
                          className="flex-1 py-1.5 text-xs transition"
                          style={{ color: activeCopyVariant === i ? 'var(--braive-text)' : 'var(--braive-muted)', borderBottom: activeCopyVariant === i ? '2px solid var(--braive-accent)' : '2px solid transparent' }}>
                          {v.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Active variant preview */}
                  {activeCopyVariant !== null && copyVariants[activeCopyVariant] && (
                    <div className="px-3 py-2 space-y-0.5" style={{ backgroundColor: 'rgba(91,106,240,0.05)' }}>
                      <div className="text-xs font-semibold" style={{ color: 'var(--braive-text)' }}>{copyVariants[activeCopyVariant].headline}</div>
                      <div className="text-xs" style={{ color: 'var(--braive-muted)' }}>{copyVariants[activeCopyVariant].subHeadline}</div>
                      <div className="text-xs font-medium" style={{ color: 'var(--braive-accent)' }}>{copyVariants[activeCopyVariant].ctaText} →</div>
                    </div>
                  )}

                  <div className="p-3 space-y-2">
                    <input type="text" value={variantOffer} onChange={e => setVariantOffer(e.target.value)}
                      placeholder="Describe your offer…"
                      className="w-full rounded px-2.5 py-1.5 text-xs focus:outline-none"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--braive-text)' }} />
                    <button onClick={generateVariants} disabled={isGeneratingVariants}
                      className="w-full py-1.5 rounded text-xs font-medium transition"
                      style={{ backgroundColor: isGeneratingVariants ? 'rgba(255,255,255,0.05)' : 'rgba(91,106,240,0.15)', color: isGeneratingVariants ? 'var(--braive-muted)' : 'var(--braive-accent)', border: '1px solid rgba(91,106,240,0.25)' }}>
                      {isGeneratingVariants ? 'Generating…' : 'Generate A/B/C variants'}
                    </button>
                  </div>
                </div>

                {/* Layout template */}
                <div>
                  <div className="text-xs font-medium mb-2" style={{ color: 'var(--braive-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Layout Template</div>
                  <div className="grid grid-cols-1 gap-1">
                    {[{ id: 'auto', label: '✦ Auto (AI picks)', description: 'Best template for your image' }, ...TEMPLATES].map(t => (
                      <button key={t.id} onClick={() => setStyleDefaults(p => ({ ...p, template: t.id as any }))}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded text-left transition"
                        style={{ backgroundColor: styleDefaults.template === t.id ? 'rgba(91,106,240,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${styleDefaults.template === t.id ? 'rgba(91,106,240,0.4)' : 'rgba(255,255,255,0.07)'}` }}>
                        <div className="flex-1">
                          <div className="text-xs font-medium" style={{ color: styleDefaults.template === t.id ? 'var(--braive-text)' : 'var(--braive-muted)' }}>{t.label}</div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--braive-muted)', opacity: 0.7 }}>{(t as any).description}</div>
                        </div>
                        {styleDefaults.template === t.id && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--braive-accent)' }} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Regenerate button */}
                {uploadedImage && (
                  <button onClick={() => generateAll()} disabled={isGenerating}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold transition"
                    style={{ backgroundColor: isGenerating ? 'rgba(255,255,255,0.05)' : 'var(--braive-accent)', color: isGenerating ? 'var(--braive-muted)' : '#fff' }}>
                    {isGenerating
                      ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />{analysisStatus === 'analysing' ? 'Analysing…' : 'Generating…'}</span>
                      : `↺ Regenerate all`}
                  </button>
                )}
              </>
            )}

            {/* BRAND TAB */}
            {sidebarTab === 'brand' && (
              <div className="space-y-4">
                <div className="text-xs font-medium" style={{ color: 'var(--braive-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brand Kit</div>

                <div>
                  <label className="text-xs block mb-1" style={{ color: 'var(--braive-muted)' }}>Company Name</label>
                  <input type="text" value={brandKit.companyName} onChange={e => setBrandKit(p => ({ ...p, companyName: e.target.value }))}
                    placeholder="Acme Co." className="w-full rounded px-2.5 py-2 text-sm focus:outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--braive-text)' }} />
                </div>

                <div>
                  <label className="text-xs block mb-1" style={{ color: 'var(--braive-muted)' }}>Logo</label>
                  <div onClick={() => logoInputRef.current?.click()}
                    className="w-full h-14 rounded-lg flex items-center justify-center cursor-pointer transition"
                    style={{ border: `2px dashed rgba(255,255,255,0.1)` }}>
                    {brandKit.logoUrl
                      ? <img src={brandKit.logoUrl} alt="Logo" className="max-h-11 max-w-full object-contain" />
                      : <span className="text-xs" style={{ color: 'var(--braive-muted)' }}>Upload logo (PNG / SVG)</span>}
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[{ key: 'primaryColor', label: 'Primary (CTA)' }, { key: 'secondaryColor', label: 'Secondary' }].map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-xs block mb-1" style={{ color: 'var(--braive-muted)' }}>{label}</label>
                      <div className="flex items-center gap-1.5">
                        <input type="color" value={(brandKit as any)[key]} onChange={e => setBrandKit(p => ({ ...p, [key]: e.target.value }))}
                          className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer flex-shrink-0" />
                        <input type="text" value={(brandKit as any)[key]} onChange={e => setBrandKit(p => ({ ...p, [key]: e.target.value }))}
                          className="flex-1 rounded px-1.5 py-1.5 text-xs font-mono focus:outline-none"
                          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--braive-text)' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs block mb-1" style={{ color: 'var(--braive-muted)' }}>Font</label>
                  <select value={brandKit.fontFamily} onChange={e => setBrandKit(p => ({ ...p, fontFamily: e.target.value }))}
                    className="w-full rounded px-2.5 py-2 text-sm focus:outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--braive-text)' }}>
                    {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="space-y-3 pt-1" style={{ borderTop: '1px solid var(--braive-border)' }}>
                  <div className="text-xs font-medium pt-3" style={{ color: 'var(--braive-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Style Defaults</div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--braive-muted)' }}>Overlay Opacity</span>
                      <span className="text-xs font-mono" style={{ color: 'var(--braive-text)' }}>{Math.round(styleDefaults.overlayOpacity * 100)}%</span>
                    </div>
                    <input type="range" min={0} max={100} value={Math.round(styleDefaults.overlayOpacity * 100)}
                      onChange={e => setStyleDefaults(p => ({ ...p, overlayOpacity: +e.target.value / 100 }))} className="w-full" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[{ key: 'textColor', label: 'Text' }, { key: 'overlayColor', label: 'Overlay' }].map(({ key, label }) => (
                      <div key={key}>
                        <label className="text-xs block mb-1" style={{ color: 'var(--braive-muted)' }}>{label}</label>
                        <div className="flex items-center gap-1.5">
                          <input type="color" value={(styleDefaults as any)[key]} onChange={e => setStyleDefaults(p => ({ ...p, [key]: e.target.value }))}
                            className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer flex-shrink-0" />
                          <input type="text" value={(styleDefaults as any)[key]} onChange={e => setStyleDefaults(p => ({ ...p, [key]: e.target.value }))}
                            className="flex-1 rounded px-1.5 py-1.5 text-xs font-mono focus:outline-none"
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--braive-text)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PLATFORMS TAB */}
            {sidebarTab === 'platforms' && (
              <div className="space-y-3">
                <div className="text-xs font-medium" style={{ color: 'var(--braive-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{totalSpecs} sizes selected</div>
                {PLATFORM_CATEGORIES.map(cat => {
                  const isOn = selectedCategoryIds.includes(cat.id)
                  const catSpecs = getSpecsForCategory(cat.id)
                  const specCount = catSpecs.reduce((a, s) => a + s.specs.length, 0)
                  return (
                    <div key={cat.id}>
                      <button onClick={() => setSelectedCategoryIds(prev => isOn ? prev.filter(id => id !== cat.id) : [...prev, cat.id])}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition"
                        style={{ backgroundColor: isOn ? 'rgba(91,106,240,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isOn ? 'rgba(91,106,240,0.35)' : 'rgba(255,255,255,0.07)'}` }}>
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: isOn ? cat.color : 'rgba(255,255,255,0.2)' }} />
                        <div className="flex-1">
                          <div className="text-sm font-medium" style={{ color: isOn ? 'var(--braive-text)' : 'var(--braive-muted)' }}>{cat.label}</div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--braive-muted)', opacity: 0.7 }}>{cat.description}</div>
                        </div>
                        <span className="text-xs" style={{ color: 'var(--braive-muted)' }}>{specCount}</span>
                      </button>
                      {isOn && (
                        <div className="mt-1 ml-3 space-y-0.5">
                          {catSpecs.map(set => (
                            <div key={set.id} className="flex items-center justify-between px-2 py-1 rounded text-xs" style={{ color: 'var(--braive-muted)' }}>
                              <span>{set.label}</span>
                              <span>{set.specs.length} sizes</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Category + Platform tabs */}
          {hasLayouts && (
            <div className="flex flex-col flex-shrink-0" style={{ borderBottom: '1px solid var(--braive-border)' }}>
              {/* Category row */}
              <div className="flex items-center gap-1 px-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {PLATFORM_CATEGORIES.filter(c => selectedCategoryIds.includes(c.id)).map(cat => (
                  <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setActivePlatform(null) }}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5"
                    style={{ backgroundColor: activeCategory === cat.id ? 'rgba(91,106,240,0.2)' : 'transparent', color: activeCategory === cat.id ? 'var(--braive-text)' : 'var(--braive-muted)' }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.label}
                  </button>
                ))}
              </div>
              {/* Platform row */}
              <div className="flex items-center gap-1 px-4 py-1.5">
                {getSpecsForCategory(activeCategory).map(set => {
                  const isActive = activePlatform === set.id || (!activePlatform && getSpecsForCategory(activeCategory)[0]?.id === set.id)
                  return (
                    <button key={set.id} onClick={() => setActivePlatform(set.id)}
                      className="px-2.5 py-1 rounded text-xs transition flex items-center gap-1.5"
                      style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.07)' : 'transparent', color: isActive ? 'var(--braive-text)' : 'var(--braive-muted)' }}>
                      {set.label}
                      <span style={{ color: 'rgba(255,255,255,0.25)' }}>({set.specs.length})</span>
                    </button>
                  )
                })}
                {displayedPlatform && (
                  <button onClick={() => setPreviewSetId(displayedPlatform.id)} className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition"
                    style={{ color: 'var(--braive-muted)', backgroundColor: 'rgba(255,255,255,0.04)' }}>
                    👁 Preview in feed
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Canvas grid */}
          <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: 'var(--braive-bg)' }}>
            {!uploadedImage ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                <div onClick={() => imageInputRef.current?.click()} className="cursor-pointer rounded-2xl p-10 transition"
                  style={{ border: '2px dashed rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-5xl mb-3">📸</div>
                  <div className="text-base font-medium mb-1" style={{ color: 'var(--braive-text)' }}>Upload your hero image to get started</div>
                  <div className="text-sm" style={{ color: 'var(--braive-muted)' }}>JPG · PNG · WEBP · Drop anywhere</div>
                </div>
              </div>
            ) : isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'rgba(91,106,240,0.3)', borderTopColor: 'var(--braive-accent)' }} />
                <div className="text-sm" style={{ color: 'var(--braive-muted)' }}>{analysisStatus === 'analysing' ? 'Analysing image…' : `Generating ${totalSpecs} sizes…`}</div>
              </div>
            ) : displayedPlatform ? (
              <>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: displayedPlatform.color }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--braive-text)' }}>{displayedPlatform.platform}</span>
                  <span className="text-xs" style={{ color: 'var(--braive-muted)' }}>{displayedPlatform.specs.length} sizes · click element to edit</span>
                </div>
                <div className="flex flex-wrap gap-5 items-start">
                  {displayedPlatform.specs.map(spec => (
                    <AdCanvas key={spec.id} spec={spec} imageUrl={uploadedImage} logoUrl={brandKit.logoUrl}
                      brandKit={brandKit} copySet={effectiveCopy} layout={layouts[spec.id] || []}
                      overrides={overrides[spec.id] || {}} locked={locked[spec.id] || {}}
                      selectedIndex={selectedEl?.specId === spec.id ? selectedEl.index : null}
                      analysis={lastAnalysis}
                      showSafeZones={showSafeZones}
                      onElementSelect={handleElementSelect} onDeselect={() => setSelectedEl(null)}
                      onLockToggle={handleLockToggle} onRegenerate={handleRegenerate}
                      onAutoExport={handleAutoExport} onOverrideChange={handleOverrideChange}
                      onReset={handleReset} />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Floating properties panel */}
      {selectedElData && selectedEl && (
        <FloatingProperties
          element={selectedElData} override={overrides[selectedEl.specId]?.[selectedEl.index] || {}}
          locked={locked[selectedEl.specId]?.[selectedEl.index] || false}
          brandKit={brandKit} specId={selectedEl.specId} elementIndex={selectedEl.index}
          anchorX={selectedEl.x} anchorY={selectedEl.y}
          onChange={handleOverrideChange} onLockToggle={handleLockToggle}
          onApplyToAll={handleApplyToAll} onClose={() => setSelectedEl(null)} />
      )}

      {/* In-situ preview */}
      {previewSetId && (() => {
        const set = SPEC_SETS.find(s => s.id === previewSetId)
        return set ? <InSituPreview specs={set.specs} dataUrls={exportedUrls} platformId={previewSetId} onClose={() => setPreviewSetId(null)} /> : null
      })()}

      {/* Export summary modal */}
      {showExportSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={() => setShowExportSummary(false)}>
          <div className="rounded-2xl p-8 max-w-md w-full mx-4" style={{ backgroundColor: 'var(--braive-surface)', border: '1px solid var(--braive-border)' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--braive-text)' }}>Ready to export</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--braive-muted)' }}>
              {totalSpecs} files across {selectedCategoryIds.length} platform group{selectedCategoryIds.length !== 1 ? 's' : ''}, organised in folders by platform.
            </p>
            <div className="space-y-2 mb-6">
              {PLATFORM_CATEGORIES.filter(c => selectedCategoryIds.includes(c.id)).map(cat => {
                const count = getSpecsForCategory(cat.id).reduce((a, s) => a + s.specs.length, 0)
                return (
                  <div key={cat.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span style={{ color: 'var(--braive-text)' }}>{cat.label}</span>
                    </div>
                    <span style={{ color: 'var(--braive-muted)' }}>{count} files</span>
                  </div>
                )
              })}
            </div>
            <button onClick={exportAllZip} disabled={isExporting}
              className="w-full py-3 rounded-xl text-sm font-bold transition"
              style={{ backgroundColor: 'var(--braive-accent)', color: '#fff', opacity: isExporting ? 0.7 : 1 }}>
              {isExporting ? 'Exporting…' : `↓ Download ${totalSpecs} files as ZIP`}
            </button>
            <button onClick={() => setShowExportSummary(false)} className="w-full text-center text-xs mt-3" style={{ color: 'var(--braive-muted)' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

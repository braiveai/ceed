'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group, Line, Transformer } from 'react-konva'
import { AdSpec } from '@/lib/specs'
import { BrandKit, CopySet, ElementPlacement, ElementOverride, ImageAnalysis } from '@/types'
import { getSafeRect } from '@/lib/safeZones'

interface AdCanvasProps {
  spec: AdSpec
  imageUrl: string | null
  logoUrl: string | null
  brandKit: BrandKit
  copySet: CopySet
  layout: ElementPlacement[]
  overrides: Record<number, ElementOverride>
  locked: Record<number, boolean>
  selectedIndex: number | null
  analysis: ImageAnalysis
  onElementSelect: (specId: string, index: number, screenX: number, screenY: number) => void
  onDeselect: () => void
  onLockToggle: (specId: string, index: number) => void
  onRegenerate: (specId: string) => void
  onAutoExport: (dataUrl: string, specId: string) => void
  onOverrideChange: (specId: string, index: number, override: ElementOverride) => void
  onReset: (specId: string) => void
  showSafeZones?: boolean
  scale?: number
}

const DISPLAY_MAX = 460
const SNAP_THRESHOLD = 6
const GUIDE_COLOR = 'rgba(91,106,240,0.7)'

function useImage(url: string | null): [HTMLImageElement | null, boolean] {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (!url) { setImg(null); setLoaded(false); return }
    const i = new window.Image()
    i.crossOrigin = 'anonymous'
    i.onload = () => { setImg(i); setLoaded(true) }
    i.src = url
  }, [url])
  return [img, loaded]
}

async function waitForFont(fontFamily: string) {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    await Promise.all([
      document.fonts.load(`bold 16px "${fontFamily}"`),
      document.fonts.load(`400 16px "${fontFamily}"`),
    ])
  } catch {}
}

function AdCanvasInner({ spec, imageUrl, logoUrl, brandKit, copySet, layout, overrides, locked, selectedIndex, analysis, onElementSelect, onDeselect, onLockToggle, onRegenerate, onAutoExport, onOverrideChange, onReset, showSafeZones, scale }: AdCanvasProps) {
  const stageRef = useRef<any>(null)
  const exportStageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const transformerRef = useRef<any>(null)
  const elementRefs = useRef<Record<number, any>>({})
  const [bgImage, bgLoaded] = useImage(imageUrl)
  const [logoImage, logoLoaded] = useImage(logoUrl)
  const [fontReady, setFontReady] = useState(false)
  const [showZoom, setShowZoom] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [snapLines, setSnapLines] = useState<{ x?: number; y?: number }[]>([])

  const displayScale = scale ?? Math.min(1, DISPLAY_MAX / Math.max(spec.width, spec.height))
  const displayW = Math.round(spec.width * displayScale)
  const displayH = Math.round(spec.height * displayScale)
  const safeRect = showSafeZones ? getSafeRect(spec.id, spec.width, spec.height) : null

  // Wait for font before rendering
  useEffect(() => {
    waitForFont(brandKit.fontFamily || 'Arial').then(() => setFontReady(true))
  }, [brandKit.fontFamily])

  // Subject-aware background positioning
  const bgProps = bgImage ? (() => {
    const s = Math.max(spec.width / bgImage.width, spec.height / bgImage.height)
    const imgW = bgImage.width * s
    const imgH = bgImage.height * s
    let x = (spec.width - imgW) / 2
    let y = (spec.height - imgH) / 2
    // Shift based on subject position so subject isn't covered by overlay
    if (analysis.subjectPosition === 'left') x = 0
    if (analysis.subjectPosition === 'right') x = spec.width - imgW
    if (analysis.safeZone === 'top') y = 0
    if (analysis.safeZone === 'bottom') y = spec.height - imgH
    return { x, y, scaleX: s, scaleY: s }
  })() : null

  // Attach transformer to selected element
  useEffect(() => {
    if (!transformerRef.current) return
    if (selectedIndex !== null && elementRefs.current[selectedIndex]) {
      transformerRef.current.nodes([elementRefs.current[selectedIndex]])
    } else {
      transformerRef.current.nodes([])
    }
    transformerRef.current.getLayer()?.batchDraw()
  }, [selectedIndex])

  // Auto-export when ready
  useEffect(() => {
    if (!layout.length || !fontReady) return
    if (imageUrl && !bgLoaded) return
    if (logoUrl && !logoLoaded) return
    const t = setTimeout(() => {
      if (stageRef.current) {
        const dataUrl = stageRef.current.toDataURL({ pixelRatio: 1 / displayScale })
        onAutoExport(dataUrl, spec.id)
      }
    }, 500)
    return () => clearTimeout(t)
  }, [layout, bgLoaded, logoLoaded, fontReady, spec.id, displayScale, imageUrl, logoUrl, onAutoExport])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'Escape') onDeselect()
      if ((e.key === 'Delete' || e.key === 'Backspace') && !['INPUT','TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        onOverrideChange(spec.id, selectedIndex, {})
        onDeselect()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedIndex, spec.id, onDeselect, onOverrideChange])

  const handleElClick = (i: number, el: ElementPlacement, e: any) => {
    e.cancelBubble = true
    if (locked[i]) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const m = { ...el, ...(overrides[i] || {}) }
    const elX = m.x ?? el.x
    const elW = m.width ?? el.width
    const elY = m.y ?? el.y
    const screenX = rect.left + (elX + elW / 2) * displayScale
    const screenY = rect.top + elY * displayScale
    onElementSelect(spec.id, i, screenX, screenY)
  }

  const handleDragMove = (i: number, e: any) => {
    const node = e.target
    const nx = node.x()
    const ny = node.y()
    const nw = node.width() * (node.scaleX() || 1)
    const nh = node.height() * (node.scaleY() || 1)
    const lines: { x?: number; y?: number }[] = []

    // Centre snapping
    const centreX = spec.width / 2
    const centreY = spec.height / 2
    if (Math.abs(nx + nw / 2 - centreX) < SNAP_THRESHOLD / displayScale) {
      node.x(centreX - nw / 2)
      lines.push({ x: centreX })
    }
    if (Math.abs(ny + nh / 2 - centreY) < SNAP_THRESHOLD / displayScale) {
      node.y(centreY - nh / 2)
      lines.push({ y: centreY })
    }
    setSnapLines(lines)
  }

  const handleDragEnd = (i: number, el: ElementPlacement, e: any) => {
    setSnapLines([])
    const node = e.target
    onOverrideChange(spec.id, i, { ...(overrides[i] || {}), x: Math.round(node.x()), y: Math.round(node.y()) })
  }

  const handleTransformEnd = (i: number, el: ElementPlacement, e: any) => {
    const node = e.target
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    node.scaleX(1)
    node.scaleY(1)
    onOverrideChange(spec.id, i, {
      ...(overrides[i] || {}),
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      width: Math.round((node.width() || el.width) * scaleX),
      height: Math.round((node.height() || el.height) * scaleY),
    })
  }

  const renderEls = (scl: number, interactive: boolean) => {
    if (!fontReady && interactive) return null
    return layout.map((el, i) => {
      const ov = overrides[i] || {}
      const m = { ...el, ...ov }
      const isLocked = locked[i]
      const isSelected = interactive && selectedIndex === i
      const drag = !isLocked && interactive
      const common = {
        ref: (node: any) => { if (node && interactive) elementRefs.current[i] = node },
        onClick: (e: any) => interactive && handleElClick(i, el, e),
        onDragMove: (e: any) => interactive && handleDragMove(i, e),
        onDragEnd: (e: any) => interactive && handleDragEnd(i, el, e),
        onTransformEnd: (e: any) => interactive && handleTransformEnd(i, el, e),
        stroke: isSelected ? GUIDE_COLOR : undefined,
        strokeWidth: isSelected ? 2 / scl : 0,
      }

      if (el.type === 'overlay') return (
        <Rect key={i} x={m.x ?? el.x} y={m.y ?? el.y} width={m.width ?? el.width} height={m.height ?? el.height}
          fill={m.backgroundColor || '#000'} opacity={m.opacity ?? 0.5} draggable={drag} {...common} />
      )
      if (el.type === 'logo' && logoImage) {
        const lw = m.width ?? el.width
        const lh = m.height ?? el.height
        const s = Math.min(lw / logoImage.width, lh / logoImage.height)
        return <KonvaImage key={i} image={logoImage} x={m.x ?? el.x} y={m.y ?? el.y} scaleX={s} scaleY={s} draggable={drag} {...common} />
      }
      if (el.type === 'cta') return (
        <Group key={i} x={m.x ?? el.x} y={m.y ?? el.y} draggable={drag} {...common}>
          <Rect width={m.width ?? el.width} height={m.height ?? el.height} fill={m.backgroundColor || brandKit.primaryColor} cornerRadius={m.borderRadius ?? 8} />
          <Text text={copySet.ctaText} width={m.width ?? el.width} height={m.height ?? el.height} fontSize={m.fontSize || 16} fill={m.color || '#fff'} fontFamily={brandKit.fontFamily || 'Arial'} fontStyle={m.fontStyle || 'bold'} align="center" verticalAlign="middle" />
        </Group>
      )
      if (el.type === 'headline') return (
        <Text key={i} x={m.x ?? el.x} y={m.y ?? el.y} width={m.width ?? el.width} text={copySet.headline}
          fontSize={m.fontSize || 24} fill={m.color || '#fff'} fontFamily={brandKit.fontFamily || 'Arial'}
          fontStyle={m.fontStyle || 'bold'} align={m.textAlign || 'left'} draggable={drag}
          shadowColor={(el as any).shadowColor} shadowBlur={(el as any).shadowBlur} shadowOffsetX={(el as any).shadowOffsetX} shadowOffsetY={(el as any).shadowOffsetY}
          {...common} />
      )
      if (el.type === 'subheadline') return (
        <Text key={i} x={m.x ?? el.x} y={m.y ?? el.y} width={m.width ?? el.width} text={copySet.subHeadline}
          fontSize={m.fontSize || 16} fill={m.color || '#eee'} fontFamily={brandKit.fontFamily || 'Arial'}
          fontStyle={m.fontStyle || 'normal'} align={m.textAlign || 'left'} draggable={drag}
          shadowColor={(el as any).shadowColor} shadowBlur={(el as any).shadowBlur}
          {...common} />
      )
      return null
    })
  }

  const stageEl = (w: number, h: number, scl: number, ref?: any, interactive = false) => (
    <Stage ref={ref} width={w} height={h} scaleX={scl} scaleY={scl} onClick={interactive ? onDeselect : undefined}>
      <Layer>
        <Rect x={0} y={0} width={spec.width} height={spec.height} fill="#111" />
        {bgImage && bgProps && <KonvaImage image={bgImage} {...bgProps} />}
        {renderEls(scl, interactive)}
        {/* Snap guidelines */}
        {interactive && snapLines.map((line, i) => line.x !== undefined
          ? <Line key={i} points={[line.x, 0, line.x, spec.height]} stroke={GUIDE_COLOR} strokeWidth={1 / scl} dash={[4 / scl, 4 / scl]} />
          : <Line key={i} points={[0, line.y!, spec.width, line.y!]} stroke={GUIDE_COLOR} strokeWidth={1 / scl} dash={[4 / scl, 4 / scl]} />
        )}
        {/* Safe zone guide */}
        {interactive && safeRect && (
          <Rect x={safeRect.x} y={safeRect.y} width={safeRect.width} height={safeRect.height}
            stroke="rgba(255,200,0,0.6)" strokeWidth={1.5 / scl} dash={[6 / scl, 4 / scl]} listening={false} />
        )}
        {/* Transformer for resize */}
        {interactive && (
          <Transformer ref={transformerRef}
            anchorSize={8 / scl} rotateEnabled={false}
            anchorStroke={GUIDE_COLOR} borderStroke={GUIDE_COLOR}
            anchorFill="#fff" borderStrokeWidth={1 / scl}
            keepRatio={false}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 20 || newBox.height < 10) return oldBox
              return newBox
            }} />
        )}
      </Layer>
    </Stage>
  )

  return (
    <>
      <div className="flex flex-col items-center gap-1.5 group/canvas">
        <div ref={containerRef} className="relative rounded overflow-hidden" style={{ width: displayW, height: displayH, border: '1px solid rgba(255,255,255,0.08)' }}>
          {stageEl(displayW, displayH, displayScale, stageRef, true)}
          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/canvas:opacity-100 transition-opacity">
            {(displayW < 200 || displayH < 200) && (
              <button onClick={() => setShowZoom(true)} className="w-5 h-5 rounded flex items-center justify-center text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#fff' }} title="Zoom to edit">⤢</button>
            )}
            <button onClick={() => onReset(spec.id)} className="w-5 h-5 rounded flex items-center justify-center text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#fff' }} title="Reset to AI layout">✦</button>
            <button onClick={async () => { setIsRegenerating(true); await onRegenerate(spec.id); setIsRegenerating(false) }}
              className="w-5 h-5 rounded flex items-center justify-center text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#fff' }} title="Regenerate">
              {isRegenerating ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin block" /> : '↺'}
            </button>
          </div>
        </div>
        <div className="text-xs text-center" style={{ color: 'var(--braive-muted)' }}>{spec.width}×{spec.height}</div>
      </div>

      {showZoom && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8" style={{ backgroundColor: 'rgba(0,0,0,0.88)' }} onClick={() => setShowZoom(false)}>
          <div onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowZoom(false)} className="block ml-auto mb-2 text-xs" style={{ color: 'var(--braive-muted)' }}>✕ Close</button>
            <div className="rounded overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
              {stageEl(Math.round(spec.width * Math.min(2, 700 / Math.max(spec.width, spec.height))), Math.round(spec.height * Math.min(2, 700 / Math.max(spec.width, spec.height))), Math.min(2, 700 / Math.max(spec.width, spec.height)))}
            </div>
            <div className="text-center text-xs mt-2" style={{ color: 'var(--braive-muted)' }}>{spec.name} · {spec.width}×{spec.height}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default function AdCanvas(props: AdCanvasProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const displayScale = props.scale ?? Math.min(1, DISPLAY_MAX / Math.max(props.spec.width, props.spec.height))
  if (!mounted) return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="rounded flex items-center justify-center" style={{ width: Math.round(props.spec.width * displayScale), height: Math.round(props.spec.height * displayScale), border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#111' }}>
        <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.7)' }} />
      </div>
    </div>
  )
  return <AdCanvasInner {...props} />
}

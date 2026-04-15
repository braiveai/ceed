'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group } from 'react-konva'
import { AdSpec } from '@/lib/specs'
import { BrandKit, CopySet, ElementPlacement, ElementOverride } from '@/types'

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
  onElementSelect: (specId: string, index: number, screenX: number, screenY: number) => void
  onDeselect: () => void
  onLockToggle: (specId: string, index: number) => void
  onRegenerate: (specId: string) => void
  onAutoExport: (dataUrl: string, specId: string) => void
  scale?: number
}

const DISPLAY_MAX = 460

function useImage(url: string | null): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    if (!url) { setImg(null); return }
    const i = new window.Image()
    i.crossOrigin = 'anonymous'
    i.onload = () => setImg(i)
    i.src = url
  }, [url])
  return img
}

function AdCanvasInner({ spec, imageUrl, logoUrl, brandKit, copySet, layout, overrides, locked, selectedIndex, onElementSelect, onDeselect, onLockToggle, onRegenerate, onAutoExport, scale }: AdCanvasProps) {
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const bgImage = useImage(imageUrl)
  const logoImage = useImage(logoUrl)
  const [showZoom, setShowZoom] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const displayScale = scale ?? Math.min(1, DISPLAY_MAX / Math.max(spec.width, spec.height))
  const displayW = Math.round(spec.width * displayScale)
  const displayH = Math.round(spec.height * displayScale)

  const bgProps = bgImage ? (() => {
    const s = Math.max(spec.width / bgImage.width, spec.height / bgImage.height)
    return { x: (spec.width - bgImage.width * s) / 2, y: (spec.height - bgImage.height * s) / 2, scaleX: s, scaleY: s }
  })() : null

  useEffect(() => {
    if (!layout.length) return
    if (imageUrl && !bgImage) return
    if (logoUrl && !logoImage) return
    const t = setTimeout(() => {
      if (stageRef.current) onAutoExport(stageRef.current.toDataURL({ pixelRatio: 1 / displayScale }), spec.id)
    }, 400)
    return () => clearTimeout(t)
  }, [layout, bgImage, logoImage, spec.id, displayScale, imageUrl, logoUrl, onAutoExport])

  const handleElClick = (i: number, el: ElementPlacement, e: any) => {
    e.cancelBubble = true
    if (locked[i]) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const screenX = rect.left + (el.x + el.width / 2) * displayScale
    const screenY = rect.top + el.y * displayScale
    onElementSelect(spec.id, i, screenX, screenY)
  }

  const renderEls = (scl: number) => layout.map((el, i) => {
    const ov = overrides[i] || {}
    const m = { ...el, ...ov }
    const isLocked = locked[i]
    const isSelected = selectedIndex === i
    const common = {
      onClick: (e: any) => handleElClick(i, el, e),
      stroke: isSelected ? 'rgba(91,106,240,0.9)' : undefined,
      strokeWidth: isSelected ? 2 / scl : 0,
    }
    if (el.type === 'overlay') return <Rect key={i} x={el.x} y={el.y} width={el.width} height={el.height} fill={m.backgroundColor || '#000'} opacity={m.opacity ?? 0.5} draggable={!isLocked} {...common} />
    if (el.type === 'logo' && logoImage) {
      const s = Math.min(el.width / logoImage.width, el.height / logoImage.height)
      return <KonvaImage key={i} image={logoImage} x={el.x} y={el.y} scaleX={s} scaleY={s} draggable={!isLocked} {...common} />
    }
    if (el.type === 'cta') return (
      <Group key={i} x={el.x} y={el.y} draggable={!isLocked} {...common}>
        <Rect width={el.width} height={el.height} fill={m.backgroundColor || brandKit.primaryColor} cornerRadius={m.borderRadius ?? 8} />
        <Text text={copySet.ctaText} width={el.width} height={el.height} fontSize={m.fontSize || 16} fill={m.color || '#fff'} fontFamily={brandKit.fontFamily || 'Arial'} fontStyle={m.fontStyle || 'bold'} align="center" verticalAlign="middle" />
      </Group>
    )
    if (el.type === 'headline') return <Text key={i} x={el.x} y={el.y} width={el.width} text={copySet.headline} fontSize={m.fontSize || 24} fill={m.color || '#fff'} fontFamily={brandKit.fontFamily || 'Arial'} fontStyle={m.fontStyle || 'bold'} align={m.textAlign || 'left'} draggable={!isLocked} {...common} />
    if (el.type === 'subheadline') return <Text key={i} x={el.x} y={el.y} width={el.width} text={copySet.subHeadline} fontSize={m.fontSize || 16} fill={m.color || '#eee'} fontFamily={brandKit.fontFamily || 'Arial'} fontStyle={m.fontStyle || 'normal'} align={m.textAlign || 'left'} draggable={!isLocked} {...common} />
    return null
  })

  const stageEl = (w: number, h: number, scl: number, ref?: any) => (
    <Stage ref={ref} width={w} height={h} scaleX={scl} scaleY={scl} onClick={onDeselect}>
      <Layer>
        <Rect x={0} y={0} width={spec.width} height={spec.height} fill="#111" />
        {bgImage && bgProps && <KonvaImage image={bgImage} {...bgProps} />}
        {renderEls(scl)}
      </Layer>
    </Stage>
  )

  return (
    <>
      <div className="flex flex-col items-center gap-1.5 group/canvas">
        <div ref={containerRef} className="relative rounded overflow-hidden" style={{ width: displayW, height: displayH, border: '1px solid rgba(255,255,255,0.08)' }}>
          {stageEl(displayW, displayH, displayScale, stageRef)}
          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/canvas:opacity-100 transition-opacity">
            {(displayW < 200 || displayH < 200) && (
              <button onClick={() => setShowZoom(true)} className="w-5 h-5 rounded flex items-center justify-center text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff' }}>⤢</button>
            )}
            <button onClick={async () => { setIsRegenerating(true); await onRegenerate(spec.id); setIsRegenerating(false) }}
              className="w-5 h-5 rounded flex items-center justify-center text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff' }}>
              {isRegenerating ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin block" /> : '↺'}
            </button>
          </div>
        </div>
        <div className="text-center" style={{ color: 'var(--braive-muted)' }}>
          <div className="text-xs">{spec.width}×{spec.height}</div>
        </div>
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
        <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.6)' }} />
      </div>
    </div>
  )
  return <AdCanvasInner {...props} />
}

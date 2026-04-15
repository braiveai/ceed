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
  onElementSelect: (specId: string, index: number) => void
  onDeselect: () => void
  onLockToggle: (specId: string, index: number) => void
  onRegenerate: (specId: string) => void
  onAutoExport: (dataUrl: string, specId: string) => void
  scale?: number
}

const DISPLAY_MAX = 420
const ZOOM_THRESHOLD = 200

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
  const bgImage = useImage(imageUrl)
  const logoImage = useImage(logoUrl)
  const [showZoom, setShowZoom] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const displayScale = scale ?? Math.min(1, DISPLAY_MAX / Math.max(spec.width, spec.height))
  const displayW = Math.round(spec.width * displayScale)
  const displayH = Math.round(spec.height * displayScale)
  const isSmall = displayW < ZOOM_THRESHOLD || displayH < ZOOM_THRESHOLD

  const bgProps = bgImage ? (() => {
    const s = Math.max(spec.width / bgImage.width, spec.height / bgImage.height)
    return { x: (spec.width - bgImage.width * s) / 2, y: (spec.height - bgImage.height * s) / 2, scaleX: s, scaleY: s }
  })() : null

  useEffect(() => {
    if (!layout.length) return
    if (imageUrl && !bgImage) return
    if (logoUrl && !logoImage) return
    const t = setTimeout(() => {
      if (stageRef.current) {
        const dataUrl = stageRef.current.toDataURL({ pixelRatio: 1 / displayScale })
        onAutoExport(dataUrl, spec.id)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [layout, bgImage, logoImage, spec.id, displayScale, imageUrl, logoUrl, onAutoExport])

  const handleRegen = async () => {
    setIsRegenerating(true)
    await onRegenerate(spec.id)
    setIsRegenerating(false)
  }

  const renderElements = (scl: number) => layout.map((el, i) => {
    const ov = overrides[i] || {}
    const m = { ...el, ...ov }
    const isLocked = locked[i]
    const isSelected = selectedIndex === i
    const commonProps = {
      onClick: (e: any) => { e.cancelBubble = true; if (!isLocked) onElementSelect(spec.id, i) },
      stroke: isSelected ? '#FF4438' : undefined,
      strokeWidth: isSelected ? 2 / scl : 0,
    }
    if (el.type === 'overlay') return <Rect key={i} x={el.x} y={el.y} width={el.width} height={el.height} fill={m.backgroundColor || '#000'} opacity={m.opacity ?? 0.5} draggable={!isLocked} {...commonProps} />
    if (el.type === 'logo' && logoImage) {
      const s = Math.min(el.width / logoImage.width, el.height / logoImage.height)
      return <KonvaImage key={i} image={logoImage} x={el.x} y={el.y} scaleX={s} scaleY={s} draggable={!isLocked} {...commonProps} />
    }
    if (el.type === 'cta') return (
      <Group key={i} x={el.x} y={el.y} draggable={!isLocked} {...commonProps}>
        <Rect width={el.width} height={el.height} fill={m.backgroundColor || brandKit.primaryColor} cornerRadius={m.borderRadius ?? 8} />
        <Text text={copySet.ctaText} width={el.width} height={el.height} fontSize={m.fontSize || 16} fill={m.color || '#fff'} fontFamily={brandKit.fontFamily || 'Arial'} fontStyle={m.fontStyle || 'bold'} align="center" verticalAlign="middle" />
      </Group>
    )
    if (el.type === 'headline') return <Text key={i} x={el.x} y={el.y} width={el.width} text={copySet.headline} fontSize={m.fontSize || 24} fill={m.color || '#fff'} fontFamily={brandKit.fontFamily || 'Arial'} fontStyle={m.fontStyle || 'bold'} align={m.textAlign || 'left'} draggable={!isLocked} {...commonProps} />
    if (el.type === 'subheadline') return <Text key={i} x={el.x} y={el.y} width={el.width} text={copySet.subHeadline} fontSize={m.fontSize || 16} fill={m.color || '#eee'} fontFamily={brandKit.fontFamily || 'Arial'} fontStyle={m.fontStyle || 'normal'} align={m.textAlign || 'left'} draggable={!isLocked} {...commonProps} />
    return null
  })

  const stageEl = (w: number, h: number, scl: number, ref?: any) => (
    <Stage ref={ref} width={w} height={h} scaleX={scl} scaleY={scl} onClick={onDeselect}>
      <Layer>
        <Rect x={0} y={0} width={spec.width} height={spec.height} fill="#1a1a2e" />
        {bgImage && bgProps && <KonvaImage image={bgImage} {...bgProps} />}
        {renderElements(scl)}
      </Layer>
    </Stage>
  )

  return (
    <>
      <div className="flex flex-col items-center gap-1.5">
        <div className="relative border border-white/10 rounded overflow-hidden shadow-lg group"
          style={{ width: displayW, height: displayH }}>
          {stageEl(displayW, displayH, displayScale, stageRef)}
          <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isSmall && (
              <button onClick={() => setShowZoom(true)}
                className="w-6 h-6 rounded bg-black/70 hover:bg-black/90 text-white text-xs flex items-center justify-center" title="Zoom to edit">⤢</button>
            )}
            <button onClick={handleRegen} disabled={isRegenerating}
              className="w-6 h-6 rounded bg-black/70 hover:bg-black/90 text-white text-xs flex items-center justify-center" title="Regenerate this size">
              {isRegenerating ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin block" /> : '↺'}
            </button>
          </div>
        </div>
        <div className="text-xs text-zinc-600">{spec.width}×{spec.height}</div>
        <div className="text-xs text-zinc-700">{spec.placement}</div>
      </div>

      {showZoom && (
        <div className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-8" onClick={() => setShowZoom(false)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowZoom(false)} className="absolute -top-8 right-0 text-zinc-400 hover:text-white text-xs">✕ Close zoom</button>
            <div className="border border-white/20 rounded overflow-hidden">
              {stageEl(
                Math.round(spec.width * Math.min(2, 700 / Math.max(spec.width, spec.height))),
                Math.round(spec.height * Math.min(2, 700 / Math.max(spec.width, spec.height))),
                Math.min(2, 700 / Math.max(spec.width, spec.height))
              )}
            </div>
            <div className="text-center text-xs text-zinc-600 mt-2">{spec.name} · {spec.width}×{spec.height}</div>
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
      <div className="border border-white/10 rounded bg-zinc-900 flex items-center justify-center"
        style={{ width: Math.round(props.spec.width * displayScale), height: Math.round(props.spec.height * displayScale) }}>
        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  )
  return <AdCanvasInner {...props} />
}

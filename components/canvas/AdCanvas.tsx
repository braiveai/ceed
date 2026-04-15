'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group } from 'react-konva'
import { AdSpec } from '@/lib/specs'
import { BrandKit, CopySet, ElementPlacement } from '@/types'

interface AdCanvasProps {
  spec: AdSpec
  imageUrl: string | null
  logoUrl: string | null
  brandKit: BrandKit
  copySet: CopySet
  layout: ElementPlacement[]
  onExport?: (dataUrl: string, specId: string) => void
  scale?: number
}

const DISPLAY_MAX = 480

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

function AdCanvasInner({ spec, imageUrl, logoUrl, brandKit, copySet, layout, onExport, scale }: AdCanvasProps) {
  const stageRef = useRef<any>(null)
  const bgImage = useImage(imageUrl)
  const logoImage = useImage(logoUrl)

  const displayScale = scale ?? Math.min(1, DISPLAY_MAX / Math.max(spec.width, spec.height))
  const displayW = Math.round(spec.width * displayScale)
  const displayH = Math.round(spec.height * displayScale)

  const bgProps = bgImage ? (() => {
    const s = Math.max(spec.width / bgImage.width, spec.height / bgImage.height)
    return { x: (spec.width - bgImage.width * s) / 2, y: (spec.height - bgImage.height * s) / 2, scaleX: s, scaleY: s }
  })() : null

  const handleExport = useCallback(() => {
    if (!stageRef.current || !onExport) return
    onExport(stageRef.current.toDataURL({ pixelRatio: 1 / displayScale }), spec.id)
  }, [onExport, spec.id, displayScale])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="border border-white/10 rounded overflow-hidden shadow-lg" style={{ width: displayW, height: displayH }}>
        <Stage ref={stageRef} width={displayW} height={displayH} scaleX={displayScale} scaleY={displayScale}>
          <Layer>
            <Rect x={0} y={0} width={spec.width} height={spec.height} fill="#1a1a2e" />
            {bgImage && bgProps && <KonvaImage image={bgImage} {...bgProps} />}
            {layout.map((el, i) => {
              if (el.type === 'overlay') return (
                <Rect key={i} x={el.x} y={el.y} width={el.width} height={el.height}
                  fill={el.backgroundColor || '#000000'} opacity={el.opacity ?? 0.5} draggable />
              )
              if (el.type === 'logo' && logoImage) {
                const s = Math.min(el.width / logoImage.width, el.height / logoImage.height)
                return <KonvaImage key={i} image={logoImage} x={el.x} y={el.y} scaleX={s} scaleY={s} draggable />
              }
              if (el.type === 'cta') return (
                <Group key={i} x={el.x} y={el.y} draggable>
                  <Rect width={el.width} height={el.height}
                    fill={el.backgroundColor || brandKit.primaryColor} cornerRadius={el.borderRadius || 8} />
                  <Text text={copySet.ctaText} width={el.width} height={el.height}
                    fontSize={el.fontSize || 16} fill={el.color || '#ffffff'}
                    fontFamily={brandKit.fontFamily || 'Arial'} fontStyle="bold"
                    align="center" verticalAlign="middle" />
                </Group>
              )
              if (el.type === 'headline') return (
                <Text key={i} x={el.x} y={el.y} width={el.width} text={copySet.headline}
                  fontSize={el.fontSize || 24} fill={el.color || '#ffffff'}
                  fontFamily={brandKit.fontFamily || 'Arial'} fontStyle="bold"
                  align={el.textAlign || 'left'} draggable />
              )
              if (el.type === 'subheadline') return (
                <Text key={i} x={el.x} y={el.y} width={el.width} text={copySet.subHeadline}
                  fontSize={el.fontSize || 16} fill={el.color || '#eeeeee'}
                  fontFamily={brandKit.fontFamily || 'Arial'} align={el.textAlign || 'left'} draggable />
              )
              return null
            })}
          </Layer>
        </Stage>
      </div>
      <div className="text-xs text-zinc-500">{spec.width}×{spec.height} · {spec.placement}</div>
      {onExport && (
        <button onClick={handleExport} className="text-xs px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 transition">
          Export
        </button>
      )}
    </div>
  )
}

export default function AdCanvas(props: AdCanvasProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const displayScale = props.scale ?? Math.min(1, DISPLAY_MAX / Math.max(props.spec.width, props.spec.height))
  if (!mounted) return (
    <div className="flex flex-col items-center gap-2">
      <div className="border border-white/10 rounded bg-zinc-900 flex items-center justify-center"
        style={{ width: Math.round(props.spec.width * displayScale), height: Math.round(props.spec.height * displayScale) }}>
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  )
  return <AdCanvasInner {...props} />
}

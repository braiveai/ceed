'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group, Transformer } from 'react-konva'
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
  onOverrideChange: (specId: string, index: number, override: ElementOverride) => void
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

function ElementToolbar({ el, override, onChange, onClose, screenX, screenY }: {
  el: ElementPlacement
  override: ElementOverride
  onChange: (o: ElementOverride) => void
  onClose: () => void
  screenX: number
  screenY: number
}) {
  const merged = { ...el, ...override }

  return (
    <div
      className="fixed z-50 bg-zinc-800 border border-white/15 rounded-lg shadow-xl p-2 flex items-center gap-1.5 text-xs"
      style={{ left: screenX, top: screenY - 48, transform: 'translateX(-50%)' }}
      onMouseDown={e => e.stopPropagation()}
    >
      {(el.type === 'headline' || el.type === 'subheadline' || el.type === 'cta') && (<>
        {/* Font size */}
        <div className="flex items-center gap-1 border-r border-white/10 pr-2">
          <button onClick={() => onChange({ ...override, fontSize: Math.max(8, (merged.fontSize || 16) - 2) })}
            className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center">−</button>
          <span className="w-6 text-center text-zinc-300">{merged.fontSize || 16}</span>
          <button onClick={() => onChange({ ...override, fontSize: (merged.fontSize || 16) + 2 })}
            className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center">+</button>
        </div>

        {/* Bold toggle */}
        <button
          onClick={() => onChange({ ...override, fontStyle: merged.fontStyle === 'bold' ? 'normal' : 'bold' })}
          className={`w-6 h-6 rounded font-bold text-sm flex items-center justify-center transition ${merged.fontStyle === 'bold' ? 'bg-white text-zinc-900' : 'bg-white/10 hover:bg-white/20 text-zinc-300'}`}
        >B</button>

        {/* Text align */}
        {el.type !== 'cta' && (
          <div className="flex gap-0.5 border-l border-white/10 pl-1.5">
            {(['left','center','right'] as const).map(a => (
              <button key={a}
                onClick={() => onChange({ ...override, textAlign: a })}
                className={`w-6 h-6 rounded text-xs flex items-center justify-center transition ${merged.textAlign === a ? 'bg-white/20 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {a === 'left' ? '⇤' : a === 'center' ? '⇔' : '⇥'}
              </button>
            ))}
          </div>
        )}

        {/* Text colour */}
        <div className="border-l border-white/10 pl-1.5 flex items-center gap-1">
          <span className="text-zinc-500">A</span>
          <input type="color" value={merged.color || '#ffffff'}
            onChange={e => onChange({ ...override, color: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0" />
        </div>
      </>)}

      {el.type === 'cta' && (
        <div className="flex items-center gap-1 border-l border-white/10 pl-1.5">
          <span className="text-zinc-500">BG</span>
          <input type="color" value={merged.backgroundColor || '#FF4438'}
            onChange={e => onChange({ ...override, backgroundColor: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0" />
          <span className="text-zinc-500 ml-1">r</span>
          <input type="range" min={0} max={20} value={merged.borderRadius || 8}
            onChange={e => onChange({ ...override, borderRadius: Number(e.target.value) })}
            className="w-16" />
        </div>
      )}

      {el.type === 'overlay' && (
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Opacity</span>
          <input type="range" min={0} max={100} value={Math.round((merged.opacity ?? 0.5) * 100)}
            onChange={e => onChange({ ...override, opacity: Number(e.target.value) / 100 })}
            className="w-20" />
          <span className="text-zinc-400 w-6">{Math.round((merged.opacity ?? 0.5) * 100)}%</span>
          <input type="color" value={merged.backgroundColor || '#000000'}
            onChange={e => onChange({ ...override, backgroundColor: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0" />
        </div>
      )}

      <button onClick={onClose} className="ml-1 text-zinc-600 hover:text-zinc-300 pl-1.5 border-l border-white/10">✕</button>
    </div>
  )
}

function AdCanvasInner({ spec, imageUrl, logoUrl, brandKit, copySet, layout, overrides, onOverrideChange, onExport, scale }: AdCanvasProps) {
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const bgImage = useImage(imageUrl)
  const logoImage = useImage(logoUrl)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 })

  const displayScale = scale ?? Math.min(1, DISPLAY_MAX / Math.max(spec.width, spec.height))
  const displayW = Math.round(spec.width * displayScale)
  const displayH = Math.round(spec.height * displayScale)

  const bgProps = bgImage ? (() => {
    const s = Math.max(spec.width / bgImage.width, spec.height / bgImage.height)
    return { x: (spec.width - bgImage.width * s) / 2, y: (spec.height - bgImage.height * s) / 2, scaleX: s, scaleY: s }
  })() : null

  const handleExport = useCallback(() => {
    if (!stageRef.current || !onExport) return
    setSelectedIndex(null)
    setTimeout(() => {
      onExport(stageRef.current.toDataURL({ pixelRatio: 1 / displayScale }), spec.id)
    }, 50)
  }, [onExport, spec.id, displayScale])

  const handleElementClick = (index: number, el: ElementPlacement, e: any) => {
    e.cancelBubble = true
    const container = containerRef.current?.getBoundingClientRect()
    if (!container) return
    const elScreenX = container.left + (el.x + el.width / 2) * displayScale
    const elScreenY = container.top + el.y * displayScale
    setToolbarPos({ x: elScreenX, y: elScreenY })
    setSelectedIndex(index)
  }

  return (
    <div className="flex flex-col items-center gap-2 relative">
      <div
        ref={containerRef}
        className="border border-white/10 rounded overflow-hidden shadow-lg cursor-pointer"
        style={{ width: displayW, height: displayH }}
        onClick={() => setSelectedIndex(null)}
      >
        <Stage ref={stageRef} width={displayW} height={displayH} scaleX={displayScale} scaleY={displayScale}>
          <Layer>
            <Rect x={0} y={0} width={spec.width} height={spec.height} fill="#1a1a2e" />
            {bgImage && bgProps && <KonvaImage image={bgImage} {...bgProps} />}

            {layout.map((el, i) => {
              const ov = overrides[i] || {}
              const merged = { ...el, ...ov }
              const isSelected = selectedIndex === i

              const selectProps = {
                onClick: (e: any) => handleElementClick(i, el, e),
                stroke: isSelected ? '#FF4438' : undefined,
                strokeWidth: isSelected ? 1 / displayScale : 0,
              }

              if (el.type === 'overlay') return (
                <Rect key={i} x={el.x} y={el.y} width={el.width} height={el.height}
                  fill={merged.backgroundColor || '#000000'} opacity={merged.opacity ?? 0.5}
                  draggable {...selectProps} />
              )
              if (el.type === 'logo' && logoImage) {
                const s = Math.min(el.width / logoImage.width, el.height / logoImage.height)
                return <KonvaImage key={i} image={logoImage} x={el.x} y={el.y} scaleX={s} scaleY={s}
                  draggable {...selectProps} />
              }
              if (el.type === 'cta') return (
                <Group key={i} x={el.x} y={el.y} draggable {...selectProps}>
                  <Rect width={el.width} height={el.height}
                    fill={merged.backgroundColor || brandKit.primaryColor}
                    cornerRadius={merged.borderRadius || 8} />
                  <Text text={copySet.ctaText} width={el.width} height={el.height}
                    fontSize={merged.fontSize || 16} fill={merged.color || '#ffffff'}
                    fontFamily={brandKit.fontFamily || 'Arial'}
                    fontStyle={merged.fontStyle || 'bold'}
                    align="center" verticalAlign="middle" />
                </Group>
              )
              if (el.type === 'headline') return (
                <Text key={i} x={el.x} y={el.y} width={el.width} text={copySet.headline}
                  fontSize={merged.fontSize || 24} fill={merged.color || '#ffffff'}
                  fontFamily={brandKit.fontFamily || 'Arial'}
                  fontStyle={merged.fontStyle || 'bold'}
                  align={merged.textAlign || 'left'} draggable {...selectProps} />
              )
              if (el.type === 'subheadline') return (
                <Text key={i} x={el.x} y={el.y} width={el.width} text={copySet.subHeadline}
                  fontSize={merged.fontSize || 16} fill={merged.color || '#eeeeee'}
                  fontFamily={brandKit.fontFamily || 'Arial'}
                  fontStyle={merged.fontStyle || 'normal'}
                  align={merged.textAlign || 'left'} draggable {...selectProps} />
              )
              return null
            })}
          </Layer>
        </Stage>
      </div>

      <div className="text-xs text-zinc-500">{spec.width}×{spec.height} · {spec.placement}</div>
      {onExport && (
        <button onClick={handleExport}
          className="text-xs px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 transition">
          Export
        </button>
      )}

      {selectedIndex !== null && layout[selectedIndex] && (
        <ElementToolbar
          el={layout[selectedIndex]}
          override={overrides[selectedIndex] || {}}
          onChange={o => onOverrideChange(spec.id, selectedIndex, o)}
          onClose={() => setSelectedIndex(null)}
          screenX={toolbarPos.x}
          screenY={toolbarPos.y}
        />
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

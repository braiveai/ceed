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
  onOverrideChange: (specId: string, index: number, override: ElementOverride) => void
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

function Toolbar({ el, override, locked, onChange, onLock, onClose, x, y }: {
  el: ElementPlacement; override: ElementOverride; locked: boolean
  onChange: (o: ElementOverride) => void; onLock: () => void; onClose: () => void
  x: number; y: number
}) {
  const m = { ...el, ...override }
  const isText = el.type === 'headline' || el.type === 'subheadline' || el.type === 'cta'

  return (
    <div className="fixed z-50 bg-zinc-800 border border-white/15 rounded-lg shadow-2xl flex items-center gap-1 px-2 py-1.5 text-xs select-none"
      style={{ left: x, top: y - 44, transform: 'translateX(-50%)' }}
      onMouseDown={e => e.stopPropagation()}>

      {isText && <>
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-white/10">
          <button onClick={() => onChange({ ...override, fontSize: Math.max(8, (m.fontSize || 16) - 1) })}
            className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-mono">−</button>
          <span className="w-7 text-center text-zinc-200 font-mono text-xs">{m.fontSize || 16}</span>
          <button onClick={() => onChange({ ...override, fontSize: (m.fontSize || 16) + 1 })}
            className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-mono">+</button>
        </div>

        <button onClick={() => onChange({ ...override, fontStyle: m.fontStyle === 'bold' ? 'normal' : 'bold' })}
          className={`w-6 h-6 rounded font-bold flex items-center justify-center transition ${m.fontStyle === 'bold' ? 'bg-white text-zinc-900' : 'bg-white/10 text-zinc-300 hover:bg-white/20'}`}>B</button>

        <button onClick={() => onChange({ ...override, fontStyle: m.fontStyle === 'italic' ? 'normal' : 'italic' })}
          className={`w-6 h-6 rounded italic flex items-center justify-center transition ${m.fontStyle === 'italic' ? 'bg-white text-zinc-900' : 'bg-white/10 text-zinc-300 hover:bg-white/20'}`}>I</button>

        {el.type !== 'cta' && (
          <div className="flex gap-0.5 px-1.5 border-x border-white/10">
            {(['left','center','right'] as const).map(a => (
              <button key={a} onClick={() => onChange({ ...override, textAlign: a })}
                className={`w-6 h-6 rounded text-xs flex items-center justify-center transition ${m.textAlign === a ? 'bg-white/20 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {a === 'left' ? '⬛' : a === 'center' ? '▣' : '⬛'}
                <span className="sr-only">{a}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 px-1.5 border-r border-white/10">
          <span className="text-zinc-500 text-xs">A</span>
          <input type="color" value={m.color || '#ffffff'}
            onChange={e => onChange({ ...override, color: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" />
        </div>
      </>}

      {el.type === 'cta' && (
        <div className="flex items-center gap-1.5 px-1.5 border-r border-white/10">
          <span className="text-zinc-500">BG</span>
          <input type="color" value={m.backgroundColor || '#FF4438'}
            onChange={e => onChange({ ...override, backgroundColor: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" />
          <span className="text-zinc-500">r</span>
          <input type="range" min={0} max={20} value={m.borderRadius ?? 8}
            onChange={e => onChange({ ...override, borderRadius: +e.target.value })}
            className="w-14 accent-orange-500" />
        </div>
      )}

      {el.type === 'overlay' && (
        <div className="flex items-center gap-1.5 px-1.5 border-r border-white/10">
          <input type="color" value={m.backgroundColor || '#000000'}
            onChange={e => onChange({ ...override, backgroundColor: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" />
          <input type="range" min={0} max={100} value={Math.round((m.opacity ?? 0.5) * 100)}
            onChange={e => onChange({ ...override, opacity: +e.target.value / 100 })}
            className="w-20 accent-orange-500" />
          <span className="text-zinc-400 w-7 font-mono">{Math.round((m.opacity ?? 0.5) * 100)}%</span>
        </div>
      )}

      <button onClick={onLock} title={locked ? 'Unlock' : 'Lock'}
        className={`w-6 h-6 rounded flex items-center justify-center transition ${locked ? 'bg-orange-500/20 text-orange-400' : 'text-zinc-500 hover:text-zinc-300 bg-white/5'}`}>
        {locked ? '🔒' : '🔓'}
      </button>
      <button onClick={onClose} className="w-5 h-5 flex items-center justify-center text-zinc-600 hover:text-zinc-300 ml-0.5">✕</button>
    </div>
  )
}

function AdCanvasInner({ spec, imageUrl, logoUrl, brandKit, copySet, layout, overrides, locked, onOverrideChange, onLockToggle, onRegenerate, onAutoExport, scale }: AdCanvasProps) {
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const bgImage = useImage(imageUrl)
  const logoImage = useImage(logoUrl)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 })
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

  // Auto-export when layout + images are ready
  useEffect(() => {
    if (!layout.length) return
    if (imageUrl && !bgImage) return
    if (logoUrl && !logoImage) return
    const t = setTimeout(() => {
      if (stageRef.current) {
        const dataUrl = stageRef.current.toDataURL({ pixelRatio: 1 / displayScale })
        onAutoExport(dataUrl, spec.id)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [layout, bgImage, logoImage, spec.id, displayScale, imageUrl, logoUrl, onAutoExport])

  const handleElementClick = (i: number, el: ElementPlacement, e: any) => {
    e.cancelBubble = true
    if (locked[i]) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setToolbarPos({ x: rect.left + (el.x + el.width / 2) * displayScale, y: rect.top + el.y * displayScale })
    setSelectedIdx(i)
  }

  const handleRegen = async () => {
    setIsRegenerating(true)
    await onRegenerate(spec.id)
    setIsRegenerating(false)
  }

  const renderElements = (scl: number) => layout.map((el, i) => {
    const ov = overrides[i] || {}
    const m = { ...el, ...ov }
    const isLocked = locked[i]
    const isSelected = selectedIdx === i
    const sel = { onClick: (e: any) => handleElementClick(i, el, e), stroke: isSelected ? '#FF4438' : undefined, strokeWidth: isSelected ? 1.5 / scl : 0 }

    if (el.type === 'overlay') return <Rect key={i} x={el.x} y={el.y} width={el.width} height={el.height} fill={m.backgroundColor || '#000'} opacity={m.opacity ?? 0.5} draggable={!isLocked} {...sel} />
    if (el.type === 'logo' && logoImage) {
      const s = Math.min(el.width / logoImage.width, el.height / logoImage.height)
      return <KonvaImage key={i} image={logoImage} x={el.x} y={el.y} scaleX={s} scaleY={s} draggable={!isLocked} {...sel} />
    }
    if (el.type === 'cta') return (
      <Group key={i} x={el.x} y={el.y} draggable={!isLocked} {...sel}>
        <Rect width={el.width} height={el.height} fill={m.backgroundColor || brandKit.primaryColor} cornerRadius={m.borderRadius ?? 8} />
        <Text text={copySet.ctaText} width={el.width} height={el.height} fontSize={m.fontSize || 16} fill={m.color || '#fff'} fontFamily={brandKit.fontFamily || 'Arial'} fontStyle={m.fontStyle || 'bold'} align="center" verticalAlign="middle" />
      </Group>
    )
    if (el.type === 'headline') return <Text key={i} x={el.x} y={el.y} width={el.width} text={copySet.headline} fontSize={m.fontSize || 24} fill={m.color || '#fff'} fontFamily={brandKit.fontFamily || 'Arial'} fontStyle={m.fontStyle || 'bold'} align={m.textAlign || 'left'} draggable={!isLocked} {...sel} />
    if (el.type === 'subheadline') return <Text key={i} x={el.x} y={el.y} width={el.width} text={copySet.subHeadline} fontSize={m.fontSize || 16} fill={m.color || '#eee'} fontFamily={brandKit.fontFamily || 'Arial'} fontStyle={m.fontStyle || 'normal'} align={m.textAlign || 'left'} draggable={!isLocked} {...sel} />
    return null
  })

  const stageNode = (w: number, h: number, scl: number, ref?: any) => (
    <Stage ref={ref} width={w} height={h} scaleX={scl} scaleY={scl} onClick={() => setSelectedIdx(null)}>
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
        <div ref={containerRef} className="relative border border-white/10 rounded overflow-hidden shadow-lg group"
          style={{ width: displayW, height: displayH }}>
          {stageNode(displayW, displayH, displayScale, stageRef)}

          {/* Action buttons on hover */}
          <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isSmall && (
              <button onClick={() => setShowZoom(true)}
                className="w-6 h-6 rounded bg-black/60 hover:bg-black/80 text-white text-xs flex items-center justify-center" title="Zoom to edit">⤢</button>
            )}
            <button onClick={handleRegen} disabled={isRegenerating}
              className="w-6 h-6 rounded bg-black/60 hover:bg-black/80 text-white text-xs flex items-center justify-center" title="Regenerate">
              {isRegenerating ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin block" /> : '↺'}
            </button>
          </div>
        </div>

        <div className="text-xs text-zinc-600">{spec.width}×{spec.height}</div>
        <div className="text-xs text-zinc-700">{spec.placement}</div>
      </div>

      {selectedIdx !== null && layout[selectedIdx] && (
        <Toolbar el={layout[selectedIdx]} override={overrides[selectedIdx] || {}} locked={locked[selectedIdx] || false}
          onChange={o => onOverrideChange(spec.id, selectedIdx, o)}
          onLock={() => onLockToggle(spec.id, selectedIdx)}
          onClose={() => setSelectedIdx(null)}
          x={toolbarPos.x} y={toolbarPos.y} />
      )}

      {showZoom && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8" onClick={() => setShowZoom(false)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowZoom(false)} className="absolute -top-8 right-0 text-zinc-400 hover:text-white text-sm">✕ Close</button>
            <div className="border border-white/20 rounded overflow-hidden shadow-2xl">
              {stageNode(
                Math.round(spec.width * Math.min(2, 700 / Math.max(spec.width, spec.height))),
                Math.round(spec.height * Math.min(2, 700 / Math.max(spec.width, spec.height))),
                Math.min(2, 700 / Math.max(spec.width, spec.height))
              )}
            </div>
            <div className="text-center text-xs text-zinc-500 mt-2">{spec.width}×{spec.height} · {spec.name}</div>
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

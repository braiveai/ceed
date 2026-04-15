'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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

export default function AdCanvas({
  spec,
  imageUrl,
  logoUrl,
  brandKit,
  copySet,
  layout,
  onExport,
  scale,
}: AdCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)

  const displayScale = scale ?? Math.min(1, DISPLAY_MAX / Math.max(spec.width, spec.height))
  const displayW = Math.round(spec.width * displayScale)
  const displayH = Math.round(spec.height * displayScale)

  const initCanvas = useCallback(async () => {
    if (!canvasRef.current) return

    const { fabric } = await import('fabric')

    if (fabricRef.current) {
      fabricRef.current.dispose()
    }

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: spec.width,
      height: spec.height,
      backgroundColor: '#1a1a2e',
    })

    fabricRef.current = canvas

    // Background image
    if (imageUrl) {
      fabric.Image.fromURL(imageUrl, (img: any) => {
        const scaleX = spec.width / (img.width || 1)
        const scaleY = spec.height / (img.height || 1)
        const imgScale = Math.max(scaleX, scaleY)
        img.set({
          scaleX: imgScale,
          scaleY: imgScale,
          left: (spec.width - (img.width || 0) * imgScale) / 2,
          top: (spec.height - (img.height || 0) * imgScale) / 2,
          selectable: true,
          evented: true,
        })
        canvas.add(img)
        canvas.sendToBack(img)
        canvas.renderAll()
      }, { crossOrigin: 'anonymous' })
    }

    // Place layout elements
    for (const el of layout) {
      const x = el.x * displayScale
      const y = el.y * displayScale
      const w = el.width * displayScale
      const h = el.height * displayScale
      const fs = (el.fontSize || 16) * displayScale

      if (el.type === 'overlay') {
        const rect = new fabric.Rect({
          left: x,
          top: y,
          width: w,
          height: h,
          fill: el.backgroundColor || '#000000',
          opacity: el.opacity ?? 0.5,
          selectable: true,
          evented: true,
        })
        canvas.add(rect)

      } else if (el.type === 'logo' && logoUrl) {
        fabric.Image.fromURL(logoUrl, (img: any) => {
          const scaleX = w / (img.width || 1)
          const scaleY = h / (img.height || 1)
          const imgScale = Math.min(scaleX, scaleY)
          img.set({
            left: x,
            top: y,
            scaleX: imgScale,
            scaleY: imgScale,
            selectable: true,
            evented: true,
          })
          canvas.add(img)
          canvas.renderAll()
        }, { crossOrigin: 'anonymous' })

      } else if (el.type === 'cta') {
        const group = new fabric.Group([
          new fabric.Rect({
            width: w,
            height: h,
            fill: el.backgroundColor || brandKit.primaryColor,
            rx: (el.borderRadius || 8) * displayScale,
            ry: (el.borderRadius || 8) * displayScale,
          }),
          new fabric.Text(copySet.ctaText, {
            fontSize: fs,
            fill: el.color || '#ffffff',
            fontFamily: brandKit.fontFamily || 'Arial',
            fontWeight: 'bold',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            left: w / 2,
            top: h / 2,
          }),
        ], {
          left: x,
          top: y,
          selectable: true,
          evented: true,
        })
        canvas.add(group)

      } else if (el.type === 'headline') {
        const text = new fabric.Textbox(copySet.headline, {
          left: x,
          top: y,
          width: w,
          fontSize: fs,
          fill: el.color || '#ffffff',
          fontFamily: brandKit.fontFamily || 'Arial',
          fontWeight: 'bold',
          textAlign: el.textAlign || 'left',
          selectable: true,
          evented: true,
        })
        canvas.add(text)

      } else if (el.type === 'subheadline') {
        const text = new fabric.Textbox(copySet.subHeadline, {
          left: x,
          top: y,
          width: w,
          fontSize: fs,
          fill: el.color || '#eeeeee',
          fontFamily: brandKit.fontFamily || 'Arial',
          textAlign: el.textAlign || 'left',
          selectable: true,
          evented: true,
        })
        canvas.add(text)
      }
    }

    canvas.renderAll()
    setIsReady(true)

    // Register export handler
    if (onExport) {
      const exportFn = () => {
        const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 / displayScale })
        onExport(dataUrl, spec.id)
      }
      ;(canvas as any)._ceedExport = exportFn
    }
  }, [spec, imageUrl, logoUrl, brandKit, copySet, layout, displayScale, onExport])

  useEffect(() => {
    initCanvas()
    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose()
        fabricRef.current = null
      }
    }
  }, [initCanvas])

  const handleExport = () => {
    if (fabricRef.current?._ceedExport) {
      fabricRef.current._ceedExport()
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative border border-white/10 rounded overflow-hidden shadow-lg"
        style={{ width: displayW, height: displayH }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: displayW,
            height: displayH,
            transformOrigin: 'top left',
          }}
        />
        {!isReady && (
          <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>
      <div className="text-xs text-zinc-500">
        {spec.width}×{spec.height} · {spec.placement}
      </div>
      {onExport && (
        <button
          onClick={handleExport}
          className="text-xs px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 transition"
        >
          Export
        </button>
      )}
    </div>
  )
}

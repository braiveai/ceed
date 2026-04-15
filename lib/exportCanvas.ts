import { AdSpec } from './specs'
import { BrandKit, CopySet, ElementPlacement, ElementOverride } from '@/types'

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function exportSpecToDataUrl(
  spec: AdSpec,
  imageUrl: string | null,
  logoUrl: string | null,
  brandKit: BrandKit,
  copySet: CopySet,
  layout: ElementPlacement[],
  overrides: Record<number, ElementOverride>
): Promise<string> {
  const Konva = (await import('konva')).default

  const container = document.createElement('div')
  container.style.cssText = 'position:absolute;left:-9999px;top:-9999px;'
  document.body.appendChild(container)

  const stage = new Konva.Stage({ container, width: spec.width, height: spec.height })
  const layer = new Konva.Layer()
  stage.add(layer)

  layer.add(new Konva.Rect({ x: 0, y: 0, width: spec.width, height: spec.height, fill: '#1a1a2e' }))

  if (imageUrl) {
    try {
      const bgImg = await loadImg(imageUrl)
      const s = Math.max(spec.width / bgImg.width, spec.height / bgImg.height)
      layer.add(new Konva.Image({
        image: bgImg,
        x: (spec.width - bgImg.width * s) / 2,
        y: (spec.height - bgImg.height * s) / 2,
        scaleX: s, scaleY: s,
      }))
    } catch {}
  }

  let logoImg: HTMLImageElement | null = null
  if (logoUrl) {
    try { logoImg = await loadImg(logoUrl) } catch {}
  }

  layout.forEach((el, i) => {
    const ov = overrides[i] || {}
    const m = { ...el, ...ov }

    if (el.type === 'overlay') {
      layer.add(new Konva.Rect({ x: el.x, y: el.y, width: el.width, height: el.height, fill: m.backgroundColor || '#000', opacity: m.opacity ?? 0.5 }))
    } else if (el.type === 'logo' && logoImg) {
      const s = Math.min(el.width / logoImg.width, el.height / logoImg.height)
      layer.add(new Konva.Image({ image: logoImg, x: el.x, y: el.y, scaleX: s, scaleY: s }))
    } else if (el.type === 'cta') {
      layer.add(new Konva.Rect({ x: el.x, y: el.y, width: el.width, height: el.height, fill: m.backgroundColor || brandKit.primaryColor, cornerRadius: m.borderRadius || 8 }))
      layer.add(new Konva.Text({ x: el.x, y: el.y, width: el.width, height: el.height, text: copySet.ctaText, fontSize: m.fontSize || 16, fill: m.color || '#fff', fontFamily: brandKit.fontFamily || 'Arial', fontStyle: 'bold', align: 'center', verticalAlign: 'middle' }))
    } else if (el.type === 'headline') {
      layer.add(new Konva.Text({ x: el.x, y: el.y, width: el.width, text: copySet.headline, fontSize: m.fontSize || 24, fill: m.color || '#fff', fontFamily: brandKit.fontFamily || 'Arial', fontStyle: m.fontStyle || 'bold', align: m.textAlign || 'left' }))
    } else if (el.type === 'subheadline') {
      layer.add(new Konva.Text({ x: el.x, y: el.y, width: el.width, text: copySet.subHeadline, fontSize: m.fontSize || 16, fill: m.color || '#eee', fontFamily: brandKit.fontFamily || 'Arial', fontStyle: m.fontStyle || 'normal', align: m.textAlign || 'left' }))
    }
  })

  layer.draw()
  // Export at full spec resolution regardless of display scale
  const dataUrl = stage.toDataURL({ pixelRatio: 1, mimeType: 'image/png' })
  stage.destroy()
  document.body.removeChild(container)
  return dataUrl
}

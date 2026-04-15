export function estimateTextLines(text: string, fontSize: number, containerWidth: number): number {
  if (!text || containerWidth <= 0 || fontSize <= 0) return 1
  const charWidth = fontSize * 0.52
  const words = text.split(' ')
  let lines = 1
  let lineWidth = 0
  for (const word of words) {
    const ww = (word.length + 1) * charWidth
    if (lineWidth > 0 && lineWidth + ww > containerWidth) { lines++; lineWidth = ww }
    else lineWidth += ww
  }
  return lines
}

export function estimateTextHeight(text: string, fontSize: number, containerWidth: number, lineHeight = 1.3): number {
  return Math.ceil(estimateTextLines(text, fontSize, containerWidth) * fontSize * lineHeight)
}

export function fitFontSize(text: string, maxWidth: number, maxHeight: number, initialSize: number, minSize = 9): number {
  let size = initialSize
  while (size > minSize && estimateTextHeight(text, size, maxWidth) > maxHeight) size--
  return size
}

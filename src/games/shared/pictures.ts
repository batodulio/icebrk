// Turns a picked photo into something light enough to store and project. The
// browser does the resizing, so the server only ever receives small files.

// A projector rarely shows more than this, and it keeps a logo crisp.
const MAX_SIDE = 1024
// Mirrors MAX_IMAGE_BYTES in server.js.
const MAX_BYTES = 300 * 1024

/** Thrown when a file is unreadable as a picture, or stays too big after shrinking. */
export class PictureError extends Error {
  reason: 'unreadable' | 'too-big'

  constructor(reason: 'unreadable' | 'too-big') {
    super(reason)
    this.reason = reason
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/**
 * Scales a picture down to at most MAX_SIDE on its longest side and encodes it
 * as WebP, stepping the quality down until it fits under MAX_BYTES. Browsers
 * that can't encode WebP (Safari, for one) get JPEG on a white background,
 * since JPEG has no transparency and would otherwise turn it black.
 */
export async function shrinkPicture(file: File): Promise<Blob> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new PictureError('unreadable')
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new PictureError('unreadable')

  try {
    for (const quality of [0.85, 0.7, 0.55]) {
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(bitmap, 0, 0, width, height)
      let blob = await toBlob(canvas, 'image/webp', quality)

      if (blob?.type !== 'image/webp') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(bitmap, 0, 0, width, height)
        blob = await toBlob(canvas, 'image/jpeg', quality)
      }

      if (blob && blob.size <= MAX_BYTES) return blob
    }
  } finally {
    bitmap.close()
  }
  throw new PictureError('too-big')
}

/** For guests, whose pictures live in the page for the session instead of on the server. */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

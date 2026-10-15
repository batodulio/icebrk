import { useRef, useState, type ChangeEvent } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import { ImageUploadError, deleteImage, uploadImage } from '../../lib/apiClient'
import { PictureError, blobToDataUrl, shrinkPicture } from '../shared/pictures'

interface JpdCluePictureProps {
  /** The clue's current picture URL, if it has one. */
  image?: string
  /** Names the clue for screen readers, e.g. "Movies 200". */
  clueLabel: string
  onChange: (image: string | undefined) => void
}

function errorMessage(error: unknown): string {
  if (error instanceof PictureError) {
    return error.reason === 'too-big'
      ? 'That picture is a big one! Try a smaller file.'
      : 'Try a JPG, PNG, or WebP picture.'
  }
  if (error instanceof ImageUploadError) {
    if (error.status === 401) return 'Log in again to save pictures.'
    if (error.status === 409) return 'Your picture shelf is full (150). Remove a few to make room.'
    if (error.status === 413) return 'That picture is a big one! Try a smaller file.'
  }
  return 'Uploading is taking a quick break. Try again in a moment.'
}

/**
 * Add, change, or remove the picture on one clue, for "guess the brand" style
 * questions. Signed-in hosts upload to /api/images so the picture follows their
 * saved board; guests keep it in the page as a data URL, like the rest of their
 * session-only setup.
 */
export default function JpdCluePicture({ image, clueLabel, onChange }: JpdCluePictureProps) {
  const { user } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Clear the input so picking the same file again still fires a change.
    e.target.value = ''
    if (!file) return

    setBusy(true)
    setError(null)
    try {
      const small = await shrinkPicture(file)
      const url = user ? await uploadImage(small) : await blobToDataUrl(small)
      if (image) deleteImage(image)
      onChange(url)
    } catch (caught: unknown) {
      setError(errorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  const remove = () => {
    if (image) deleteImage(image)
    onChange(undefined)
    setError(null)
  }

  return (
    <div className="jpd-clue-picture">
      {image && <img className="jpd-pic-thumb" src={image} alt={`Picture for ${clueLabel}`} />}
      <button type="button" className="jpd-pic-btn" onClick={() => fileRef.current?.click()} disabled={busy}>
        {busy ? 'Adding…' : image ? '🖼️ Change picture' : '🖼️ Add picture'}
      </button>
      {image && !busy && (
        <button type="button" className="participant-remove" onClick={remove} aria-label={`Remove picture for ${clueLabel}`}>
          ×
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      {error && (
        <p className="jpd-pic-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

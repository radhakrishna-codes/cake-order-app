import { resolveAssetUrl } from './client'

export async function uploadReferenceImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  const API_BASE = import.meta.env.VITE_API_URL ?? ''
  const response = await fetch(`${API_BASE}/api/uploads`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    let message = 'Failed to upload image'
    try {
      const data = await response.json()
      if (typeof data.detail === 'string') message = data.detail
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  const data = await response.json()
  return {
    ...data,
    url: resolveAssetUrl(data.url),
  }
}

export async function uploadReferenceImages(files) {
  return Promise.all(files.map((file) => uploadReferenceImage(file)))
}

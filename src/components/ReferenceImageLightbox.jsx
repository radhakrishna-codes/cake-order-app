import { useEffect, useState } from 'react'
import './ReferenceImageLightbox.css'

export default function ReferenceImageLightbox({ images, openIndex, onClose }) {
  const [activeIndex, setActiveIndex] = useState(openIndex ?? 0)
  const isOpen = openIndex !== null && openIndex >= 0 && images.length > 0
  const currentImage = isOpen ? images[activeIndex] : null
  const canGoPrevious = activeIndex > 0
  const canGoNext = activeIndex < images.length - 1
  const hasMultiple = images.length > 1

  useEffect(() => {
    if (openIndex !== null) {
      setActiveIndex(openIndex)
    }
  }, [openIndex])

  useEffect(() => {
    if (!isOpen) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowLeft' && activeIndex > 0) {
        setActiveIndex((index) => index - 1)
      } else if (event.key === 'ArrowRight' && activeIndex < images.length - 1) {
        setActiveIndex((index) => index + 1)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, activeIndex, images.length, onClose])

  if (!isOpen || !currentImage) {
    return null
  }

  function showPrevious() {
    setActiveIndex((index) => Math.max(index - 1, 0))
  }

  function showNext() {
    setActiveIndex((index) => Math.min(index + 1, images.length - 1))
  }

  return (
    <div className="reference-lightbox-backdrop" role="presentation" onClick={onClose}>
      <div
        className="reference-lightbox-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reference-lightbox-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="reference-lightbox-header">
          <h2 id="reference-lightbox-title">Cake reference images</h2>
          <button
            type="button"
            className="reference-lightbox-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="reference-lightbox-body">
          {hasMultiple && canGoPrevious ? (
            <button
              type="button"
              className="reference-lightbox-nav reference-lightbox-prev"
              onClick={showPrevious}
              aria-label="Previous image"
            >
              ‹
            </button>
          ) : hasMultiple ? (
            <span className="reference-lightbox-nav-spacer" aria-hidden="true" />
          ) : null}

          <div className="reference-lightbox-image-wrap">
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              className="reference-lightbox-image"
            />
          </div>

          {hasMultiple && canGoNext ? (
            <button
              type="button"
              className="reference-lightbox-nav reference-lightbox-next"
              onClick={showNext}
              aria-label="Next image"
            >
              ›
            </button>
          ) : hasMultiple ? (
            <span className="reference-lightbox-nav-spacer" aria-hidden="true" />
          ) : null}
        </div>

        {hasMultiple ? (
          <footer className="reference-lightbox-footer">
            {activeIndex + 1} / {images.length}
          </footer>
        ) : null}
      </div>
    </div>
  )
}

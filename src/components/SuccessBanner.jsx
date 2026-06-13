import './SuccessBanner.css'

export default function SuccessBanner({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="success-banner" role="status">
      <p>{message}</p>
      <button type="button" className="success-banner-dismiss" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}

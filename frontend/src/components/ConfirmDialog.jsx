import './ConfirmDialog.css'

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Yes, delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  return (
    <div className="confirm-dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title">{title}</h2>
        <p>{message}</p>
        <div className="confirm-dialog-actions">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </button>
          <button type="button" className="btn-delete-confirm" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

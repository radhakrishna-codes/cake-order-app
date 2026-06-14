import {
  getPreparationStatusBadgeClass,
  getPreparationStatusLabel,
  normalizePreparationStatus,
} from '../utils/orderUtils'
import './OrderPreparationStatusBadge.css'

export default function OrderPreparationStatusBadge({ status }) {
  const preparationStatus = normalizePreparationStatus(status)

  return (
    <span className={`order-status-badge ${getPreparationStatusBadgeClass(preparationStatus)}`}>
      {getPreparationStatusLabel(preparationStatus)}
    </span>
  )
}

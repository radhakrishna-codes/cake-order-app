import { useState } from 'react'
import { getPreparationStatusOptions } from '../utils/orderUtils'
import './OrderPreparationStatusSelect.css'

export default function OrderPreparationStatusSelect({
  orderType,
  value,
  onChange,
  disabled = false,
}) {
  const [isUpdating, setIsUpdating] = useState(false)
  const options = getPreparationStatusOptions(orderType)

  async function handleChange(event) {
    const nextStatus = event.target.value
    if (nextStatus === value) return

    setIsUpdating(true)
    try {
      await onChange(nextStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <label className="order-status-select-wrap">
      <span className="sr-only">Order status</span>
      <select
        className="order-status-select"
        value={value ?? 'in_progress'}
        onChange={handleChange}
        disabled={disabled || isUpdating}
        aria-label="Order preparation status"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

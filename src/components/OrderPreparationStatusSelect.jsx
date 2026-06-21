import { useState } from 'react'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { getPreparationStatusOptions } from '../utils/orderUtils'

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
    <FormControl size="small" sx={{ minWidth: '9.5rem' }}>
      <Select
        value={value ?? 'in_progress'}
        onChange={handleChange}
        disabled={disabled || isUpdating}
        aria-label="Order preparation status"
        sx={{
          fontWeight: 700,
          fontSize: '0.9rem',
          color: 'var(--rr-gold-light)',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--rr-gold)',
            borderWidth: 2,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--rr-gold)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--rr-gold)',
            borderWidth: 2,
          },
          '& .MuiSvgIcon-root': {
            color: 'var(--rr-gold-light)',
          },
          '& .MuiSelect-select': {
            py: '0.5rem',
            pl: '0.75rem',
          },
          '&.Mui-disabled': {
            opacity: 0.7,
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: '10px',
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

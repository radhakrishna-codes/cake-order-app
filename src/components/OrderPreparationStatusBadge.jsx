import {
  getPreparationStatusLabel,
  normalizePreparationStatus,
} from '../utils/orderUtils'
import Chip from '@mui/material/Chip'

const BADGE_STYLES = {
  in_progress: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderColor: '#fcd34d',
  },
  ready_for_pickup: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderColor: '#93c5fd',
  },
  ready_for_delivery: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderColor: '#93c5fd',
  },
  completed: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    borderColor: '#86efac',
  },
}

export default function OrderPreparationStatusBadge({ status }) {
  const preparationStatus = normalizePreparationStatus(status)
  const style = BADGE_STYLES[preparationStatus] ?? BADGE_STYLES.in_progress

  return (
    <Chip
      label={getPreparationStatusLabel(preparationStatus)}
      size="small"
      sx={{
        borderRadius: '999px',
        height: 'auto',
        py: '2px',
        px: '2px',
        fontSize: '0.72rem',
        fontWeight: 700,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        borderWidth: '1px',
        borderStyle: 'solid',
        ...style,
        '& .MuiChip-label': {
          px: '8px',
        },
      }}
    />
  )
}

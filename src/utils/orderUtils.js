function toLocalDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatPickupDate(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${month}/${day}/${year}`
}

export function formatPickupDateLabel(isoDate, referenceDate = new Date()) {
  const todayKey = toLocalDateKey(referenceDate)

  const tomorrow = new Date(referenceDate)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowKey = toLocalDateKey(tomorrow)

  if (isoDate === todayKey) return 'Today'
  if (isoDate === tomorrowKey) return 'Tomorrow'
  return formatPickupDate(isoDate)
}

export function formatCakeLabel(flavor, size) {
  return `${flavor} - ${size}`
}

export function formatPickupTime(time24) {
  if (!time24) return ''
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
}

export function formatCurrency(amount) {
  const value = Number(amount)
  if (Number.isNaN(value)) return '$0.00'
  return `$${value.toFixed(2)}`
}

export function getOrderScheduleDate(order) {
  return order.orderType === 'delivery' ? order.deliveryDate : order.pickupDate
}

export function getOrderScheduleTime(order) {
  return order.orderType === 'delivery' ? order.deliveryTime : order.pickupTime
}

export function getOrderScheduleLabel(order) {
  const prefix = order.orderType === 'delivery' ? 'Delivery' : 'Pickup'
  const date = getOrderScheduleDate(order)
  return `${prefix}: ${formatPickupDateLabel(date)}`
}

export const PREPARATION_STATUS_LABELS = {
  in_progress: 'In progress',
  ready_for_pickup: 'Ready for pick up',
  ready_for_delivery: 'Ready for delivery',
  completed: 'Completed',
}

export function normalizePreparationStatus(status) {
  if (!status || status === 'not_yet_started') return 'in_progress'
  return status
}

export function getDisplayPreparationStatus(order) {
  return normalizePreparationStatus(order?.preparationStatus)
}

export function isCompletedOrder(order) {
  return getDisplayPreparationStatus(order) === 'completed'
}

export function getPreparationStatusLabel(status) {
  const normalized = normalizePreparationStatus(status)
  return PREPARATION_STATUS_LABELS[normalized] ?? PREPARATION_STATUS_LABELS.in_progress
}

export function getPreparationStatusOptions(orderType) {
  const readyOption =
    orderType === 'delivery'
      ? { value: 'ready_for_delivery', label: PREPARATION_STATUS_LABELS.ready_for_delivery }
      : { value: 'ready_for_pickup', label: PREPARATION_STATUS_LABELS.ready_for_pickup }

  return [
    { value: 'in_progress', label: PREPARATION_STATUS_LABELS.in_progress },
    readyOption,
    { value: 'completed', label: PREPARATION_STATUS_LABELS.completed },
  ]
}

export function getPreparationStatusBadgeClass(status) {
  const normalized = normalizePreparationStatus(status)
  switch (normalized) {
    case 'in_progress':
      return 'status-badge-in-progress'
    case 'ready_for_pickup':
    case 'ready_for_delivery':
      return 'status-badge-ready'
    case 'completed':
      return 'status-badge-completed'
    default:
      return 'status-badge-in-progress'
  }
}

export const HOME_STATUS_FILTERS = {
  all: 'all',
  inProgress: 'in_progress',
  ready: 'ready',
  completed: 'completed',
}

export function matchesHomeStatusFilter(order, filter) {
  const prepStatus = getDisplayPreparationStatus(order)

  switch (filter) {
    case HOME_STATUS_FILTERS.completed:
      return prepStatus === 'completed'
    case HOME_STATUS_FILTERS.inProgress:
      return prepStatus === 'in_progress'
    case HOME_STATUS_FILTERS.ready:
      return prepStatus === 'ready_for_pickup' || prepStatus === 'ready_for_delivery'
    case HOME_STATUS_FILTERS.all:
    default:
      return true
  }
}

export function getHomeStatusFilterCounts(orders) {
  return {
    [HOME_STATUS_FILTERS.all]: orders.filter((order) =>
      matchesHomeStatusFilter(order, HOME_STATUS_FILTERS.all),
    ).length,
    [HOME_STATUS_FILTERS.inProgress]: orders.filter((order) =>
      matchesHomeStatusFilter(order, HOME_STATUS_FILTERS.inProgress),
    ).length,
    [HOME_STATUS_FILTERS.ready]: orders.filter((order) =>
      matchesHomeStatusFilter(order, HOME_STATUS_FILTERS.ready),
    ).length,
    [HOME_STATUS_FILTERS.completed]: orders.filter((order) =>
      matchesHomeStatusFilter(order, HOME_STATUS_FILTERS.completed),
    ).length,
  }
}

export function groupOrdersByPickupDate(orders) {
  const groups = new Map()

  for (const order of orders) {
    const scheduleDate = getOrderScheduleDate(order)
    const scheduleType = order.orderType === 'delivery' ? 'delivery' : 'pickup'
    const groupKey = `${scheduleType}:${scheduleDate}`
    const existing = groups.get(groupKey)
    if (existing) {
      existing.items.push(order)
    } else {
      groups.set(groupKey, {
        scheduleDate,
        scheduleType,
        items: [order],
      })
    }
  }

  return [...groups.values()]
    .sort((a, b) => a.scheduleDate.localeCompare(b.scheduleDate))
    .map((group) => ({
      pickupDate: group.scheduleDate,
      pickupLabel: `${group.scheduleType === 'delivery' ? 'Delivery' : 'Pickup'}: ${formatPickupDateLabel(group.scheduleDate)}`,
      items: [...group.items].sort((a, b) =>
        getOrderScheduleTime(a).localeCompare(getOrderScheduleTime(b)),
      ),
    }))
}

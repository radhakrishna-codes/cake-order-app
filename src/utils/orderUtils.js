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

export function isInProgressOrder(order) {
  return (order.status ?? 'in_progress') !== 'completed'
}

export function isCompletedOrder(order) {
  return order.status === 'completed'
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

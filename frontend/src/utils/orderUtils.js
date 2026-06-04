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

export function groupOrdersByPickupDate(orders) {
  const groups = new Map()

  for (const order of orders) {
    const existing = groups.get(order.pickupDate)
    if (existing) {
      existing.push(order)
    } else {
      groups.set(order.pickupDate, [order])
    }
  }

  return [...groups.entries()]
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([pickupDate, items]) => ({
      pickupDate,
      pickupLabel: formatPickupDateLabel(pickupDate),
      items: [...items].sort((a, b) => a.pickupTime.localeCompare(b.pickupTime)),
    }))
}

export function createOrderId() {
  return `ord-${Date.now()}`
}

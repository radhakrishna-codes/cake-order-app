const FLAVOR_OPTIONS = [
  { value: 'black_forest', label: 'Black Forest' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'mango', label: 'Mango' },
  { value: 'custom', label: 'Custom' },
]

export function orderToFormState(order) {
  const matchedFlavor = FLAVOR_OPTIONS.find((item) => item.label === order.flavor)

  if (matchedFlavor && matchedFlavor.value !== 'custom') {
    return {
      customerName: order.customerName,
      flavor: matchedFlavor.value,
      customFlavor: '',
      size: order.size,
      pickupDate: order.pickupDate,
      pickupTime: order.pickupTime,
      total: String(order.total),
      advancePaid: String(order.advancePaid),
      greetings: order.greetings ?? '',
      modifications: order.modifications ?? '',
      referenceImage: null,
      referenceImagePreview: '',
    }
  }

  return {
    customerName: order.customerName,
    flavor: 'custom',
    customFlavor: order.flavor,
    size: order.size,
    pickupDate: order.pickupDate,
    pickupTime: order.pickupTime,
    total: String(order.total),
    advancePaid: String(order.advancePaid),
    greetings: order.greetings ?? '',
    modifications: order.modifications ?? '',
    referenceImage: null,
    referenceImagePreview: '',
  }
}

export { FLAVOR_OPTIONS }

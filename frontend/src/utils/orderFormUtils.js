const FLAVOR_OPTIONS = [
  { value: 'black_forest', label: 'Black Forest' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'mango', label: 'Mango' },
  { value: 'custom', label: 'Custom' },
]

export function orderToFormState(order) {
  const matchedFlavor = FLAVOR_OPTIONS.find((item) => item.label === order.flavor)
  const existingImageUrl = order.referenceImages?.[0] ?? ''

  const baseFields = {
    customerName: order.customerName,
    size: order.size,
    orderType: order.orderType ?? 'pickup',
    pickupDate: order.pickupDate ?? '',
    pickupTime: order.pickupTime ?? '',
    deliveryDate: order.deliveryDate ?? '',
    deliveryTime: order.deliveryTime ?? '',
    deliveryAddress: order.deliveryAddress ?? '',
    total: String(order.total),
    advancePaid: String(order.advancePaid),
    greetings: order.greetings ?? '',
    modifications: order.modifications ?? '',
    referenceImage: null,
    referenceImagePreview: existingImageUrl,
    existingReferenceImages: order.referenceImages ?? [],
    existingReferenceImageName: order.referenceImageName ?? null,
  }

  if (matchedFlavor && matchedFlavor.value !== 'custom') {
    return {
      ...baseFields,
      flavor: matchedFlavor.value,
      customFlavor: '',
    }
  }

  return {
    ...baseFields,
    flavor: 'custom',
    customFlavor: order.flavor,
  }
}

export { FLAVOR_OPTIONS }

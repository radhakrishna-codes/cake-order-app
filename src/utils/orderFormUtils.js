const FLAVOR_OPTIONS = [
  { value: 'black_forest', label: 'Black Forest' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'mango', label: 'Mango' },
  { value: 'custom', label: 'Custom' },
]

const PRESET_SIZES = ['1 lb', '2 lb', '4 lb', '6 lb', '8 lb']

function buildReferenceImageItems(order) {
  const images = order.referenceImages ?? []
  if (!images.length) return []

  return images.map((url, index) => ({
    id: `existing-${index}-${url}`,
    source: 'existing',
    url,
    name:
      index === 0 && order.referenceImageName
        ? order.referenceImageName
        : `Reference image ${index + 1}`,
  }))
}

export function orderToFormState(order) {
  const matchedFlavor = FLAVOR_OPTIONS.find((item) => item.label === order.flavor)
  const isPresetSize = PRESET_SIZES.includes(order.size)

  const baseFields = {
    customerName: order.customerName,
    customerPhoneNumber: order.customerPhoneNumber ?? '',
    size: isPresetSize ? order.size : 'custom',
    customSize: isPresetSize ? '' : order.size,
    orderType: order.orderType ?? 'pickup',
    pickupDate: order.pickupDate ?? '',
    pickupTime: order.pickupTime ?? '',
    deliveryDate: order.deliveryDate ?? '',
    deliveryTime: order.deliveryTime ?? '',
    deliveryAddress: order.deliveryAddress ?? '',
    total: String(order.total),
    advancePaid: String(order.advancePaid),
    orderTakenBy: order.orderTakenBy ?? '',
    greetings: order.greetings ?? '',
    modifications: order.modifications ?? '',
    referenceImageItems: buildReferenceImageItems(order),
    preparationStatus: order.preparationStatus ?? 'in_progress',
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

export { FLAVOR_OPTIONS, PRESET_SIZES }

import { apiRequest } from './client'

function fromApiOrder(order) {
  return {
    id: order.id,
    customerName: order.customer_name,
    flavor: order.flavor,
    size: order.size,
    orderType: order.order_type ?? 'pickup',
    pickupDate: order.pickup_date ?? '',
    pickupTime: order.pickup_time ?? '',
    deliveryDate: order.delivery_date ?? '',
    deliveryTime: order.delivery_time ?? '',
    deliveryAddress: order.delivery_address ?? '',
    total: order.total,
    advancePaid: order.advance_paid,
    pending: order.pending,
    orderTakenBy: order.order_taken_by,
    greetings: order.greetings ?? '',
    modifications: order.modifications ?? '',
    referenceImageName: order.reference_image_name,
    referenceImages: order.reference_images ?? [],
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  }
}

function toApiOrder(order) {
  return {
    customer_name: order.customerName,
    flavor: order.flavor,
    size: order.size,
    order_type: order.orderType ?? 'pickup',
    pickup_date: order.orderType === 'pickup' ? order.pickupDate : null,
    pickup_time: order.orderType === 'pickup' ? order.pickupTime : null,
    delivery_date: order.orderType === 'delivery' ? order.deliveryDate : null,
    delivery_time: order.orderType === 'delivery' ? order.deliveryTime : null,
    delivery_address: order.orderType === 'delivery' ? order.deliveryAddress : null,
    total: order.total,
    advance_paid: order.advancePaid,
    pending: order.pending,
    order_taken_by: order.orderTakenBy,
    greetings: order.greetings ?? '',
    modifications: order.modifications ?? '',
    reference_image_name: order.referenceImageName ?? null,
    reference_images: order.referenceImages ?? [],
  }
}

export async function listOrders() {
  const data = await apiRequest('/api/orders')
  return data.map(fromApiOrder)
}

export async function getOrder(orderId) {
  const data = await apiRequest(`/api/orders/${orderId}`)
  return fromApiOrder(data)
}

export async function createOrder(order) {
  const data = await apiRequest('/api/orders', {
    method: 'POST',
    body: JSON.stringify(toApiOrder(order)),
  })
  return fromApiOrder(data)
}

export async function updateOrder(orderId, order) {
  const data = await apiRequest(`/api/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify(toApiOrder(order)),
  })
  return fromApiOrder(data)
}

export async function deleteOrder(orderId) {
  await apiRequest(`/api/orders/${orderId}`, { method: 'DELETE' })
}

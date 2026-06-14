import { apiRequest } from './client'
import { HOME_STATUS_FILTERS, normalizePreparationStatus } from '../utils/orderUtils'

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
    preparationStatus: normalizePreparationStatus(order.preparation_status),
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

function fromApiStatusCounts(counts) {
  return {
    [HOME_STATUS_FILTERS.all]: counts.all,
    [HOME_STATUS_FILTERS.inProgress]: counts.in_progress,
    [HOME_STATUS_FILTERS.ready]: counts.ready,
    [HOME_STATUS_FILTERS.completed]: counts.completed,
  }
}

export async function listOrders({ statusFilter = HOME_STATUS_FILTERS.all } = {}) {
  const params = new URLSearchParams({ status_filter: statusFilter })
  const data = await apiRequest(`/api/orders?${params}`)
  return {
    orders: data.orders.map(fromApiOrder),
    counts: fromApiStatusCounts(data.counts),
  }
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

export async function updatePreparationStatus(orderId, preparationStatus) {
  const data = await apiRequest(`/api/orders/${orderId}/preparation-status`, {
    method: 'PATCH',
    body: JSON.stringify({ preparation_status: preparationStatus }),
  })
  return fromApiOrder(data)
}

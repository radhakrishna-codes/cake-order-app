import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import CakeOrderForm from '../components/CakeOrderForm'
import PageLayout from '../components/PageLayout'
import { useOrders } from '../context/OrdersContext'
import { formatCakeLabel } from '../utils/orderUtils'

export default function EditOrderPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { getOrderById, fetchOrderById, updateOrder, loading: ordersLoading } = useOrders()
  const [order, setOrder] = useState(() => getOrderById(orderId))
  const [loading, setLoading] = useState(!order)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadOrder() {
      const cached = getOrderById(orderId)
      if (cached) {
        setOrder(cached)
        setLoading(false)
        return
      }

      if (ordersLoading) return

      setLoading(true)
      setError(null)
      try {
        const fetched = await fetchOrderById(orderId)
        if (!cancelled) setOrder(fetched)
      } catch (err) {
        if (!cancelled) {
          setOrder(null)
          setError(err.message ?? 'Failed to load order')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadOrder()
    return () => {
      cancelled = true
    }
  }, [orderId, getOrderById, fetchOrderById, ordersLoading])

  async function handleSave(orderData) {
    await updateOrder(order.id, orderData)
    navigate('/')
  }

  if (loading || ordersLoading) {
    return (
      <PageLayout title="Edit Cake Order" backTo="/">
        <p className="page-message">Loading order...</p>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout title="Edit Cake Order" backTo="/">
        <p className="page-message page-message-error">{error}</p>
      </PageLayout>
    )
  }

  if (!order) {
    return <Navigate to="/" replace />
  }

  return (
    <PageLayout
      title="Edit Cake Order"
      subtitle={formatCakeLabel(order.flavor, order.size)}
      backTo={`/orders/${order.id}`}
    >
      <CakeOrderForm
        mode="edit"
        initialOrder={order}
        onCancel={() => navigate(`/orders/${order.id}`)}
        onSave={handleSave}
      />
    </PageLayout>
  )
}

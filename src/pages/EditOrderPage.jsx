import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Alert } from '@mui/material'
import CakeOrderForm from '../components/CakeOrderForm'
import PageLayout from '../components/PageLayout'
import { useOrders } from '../context/OrdersContext'
import { formatCakeLabel, isCompletedOrder } from '../utils/orderUtils'

export default function EditOrderPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { fetchOrderById, updateOrder } = useOrders()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadOrder() {
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
  }, [orderId, fetchOrderById])

  async function handleSave(orderData) {
    await updateOrder(order.id, orderData)
    navigate('/')
  }

  if (loading) {
    return (
      <PageLayout title="Edit Cake Order" backTo="/">
        <Alert severity="info">Loading order...</Alert>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout title="Edit Cake Order" backTo="/">
        <Alert severity="error">{error}</Alert>
      </PageLayout>
    )
  }

  if (!order) {
    return <Navigate to="/" replace />
  }

  if (isCompletedOrder(order)) {
    return <Navigate to={`/orders/${order.id}`} replace />
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

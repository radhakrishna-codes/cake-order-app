import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import CakeOrderForm from '../components/CakeOrderForm'
import ConfirmDialog from '../components/ConfirmDialog'
import PageLayout from '../components/PageLayout'
import { useOrders } from '../context/OrdersContext'
import { formatCakeLabel, isCompletedOrder } from '../utils/orderUtils'
import './EditOrderPage.css'

export default function EditOrderPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { getOrderById, fetchOrderById, updateOrder, deleteOrder, loading: ordersLoading } =
    useOrders()
  const [order, setOrder] = useState(() => getOrderById(orderId))
  const [loading, setLoading] = useState(!order)
  const [error, setError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

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

  async function handleConfirmDelete() {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteOrder(order.id)
      navigate('/')
    } catch (err) {
      setDeleteError(err.message ?? 'Failed to delete order')
      setIsDeleting(false)
    }
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

  if (isCompletedOrder(order)) {
    return <Navigate to={`/completed/orders/${order.id}`} replace />
  }

  return (
    <>
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

        <div className="edit-order-danger-zone">
          <button
            type="button"
            className="btn-delete-order"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Order
          </button>
          {deleteError ? <p className="edit-delete-error">{deleteError}</p> : null}
        </div>
      </PageLayout>

      {showDeleteConfirm ? (
        <ConfirmDialog
          title="Delete this order?"
          message={`Are you sure you want to remove ${order.customerName}'s cake order? This action cannot be undone.`}
          confirmLabel="Yes, delete"
          loadingLabel="Deleting..."
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            if (!isDeleting) setShowDeleteConfirm(false)
          }}
          isLoading={isDeleting}
        />
      ) : null}
    </>
  )
}

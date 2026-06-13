import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import PageLayout from '../components/PageLayout'
import { useOrders } from '../context/OrdersContext'
import { formatCakeLabel, formatPickupDateLabel, formatPickupTime, isCompletedOrder } from '../utils/orderUtils'
import './OrderDetailPage.css'

export default function OrderDetailPage({ completedView = false }) {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const {
    getOrderById,
    fetchOrderById,
    deleteOrder,
    completeOrder,
    reopenOrder,
    refreshOrders,
    loading: ordersLoading,
  } = useOrders()
  const [order, setOrder] = useState(() => getOrderById(orderId))
  const [loading, setLoading] = useState(!order)
  const [error, setError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showReopenConfirm, setShowReopenConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isReopening, setIsReopening] = useState(false)
  const [actionError, setActionError] = useState(null)
  const isLeavingRef = useRef(false)

  useEffect(() => {
    isLeavingRef.current = false
  }, [orderId])

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

  async function handleConfirmDelete() {
    setIsDeleting(true)
    setActionError(null)
    try {
      await deleteOrder(order.id)
      isLeavingRef.current = true
      setShowDeleteConfirm(false)
      navigate('/', { replace: true })
      refreshOrders({ silent: true })
    } catch (err) {
      setActionError(err.message ?? 'Failed to delete order')
      setIsDeleting(false)
    }
  }

  async function handleConfirmComplete() {
    const customerName = order.customerName
    setIsCompleting(true)
    setActionError(null)
    try {
      await completeOrder(order.id)
      isLeavingRef.current = true
      setShowCompleteConfirm(false)
      navigate('/', {
        replace: true,
        state: {
          successMessage: `${customerName}'s order has been moved to completed order list`,
        },
      })
      refreshOrders({ silent: true })
    } catch (err) {
      setActionError(err.message ?? 'Failed to complete order')
      setIsCompleting(false)
    }
  }

  async function handleConfirmReopen() {
    const customerName = order.customerName
    setIsReopening(true)
    setActionError(null)
    try {
      await reopenOrder(order.id)
      isLeavingRef.current = true
      setShowReopenConfirm(false)
      navigate('/', {
        replace: true,
        state: {
          successMessage: `${customerName}'s order has been reopened`,
        },
      })
      refreshOrders({ silent: true })
    } catch (err) {
      setActionError(err.message ?? 'Failed to reopen order')
      setIsReopening(false)
    }
  }

  const isActionInProgress = isDeleting || isCompleting || isReopening
  const backTo = completedView ? '/completed' : '/'

  if ((loading || ordersLoading) && !isActionInProgress) {
    return (
      <PageLayout title="Cake Order Details" backTo={backTo}>
        <p className="page-message">Loading order...</p>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout title="Cake Order Details" backTo={backTo}>
        <p className="page-message page-message-error">{error}</p>
      </PageLayout>
    )
  }

  if (!order) {
    return <Navigate to={backTo} replace />
  }

  const orderIsCompleted = isCompletedOrder(order)

  if (completedView && !orderIsCompleted && !isReopening && !isLeavingRef.current) {
    return <Navigate to={`/orders/${order.id}`} replace />
  }

  if (!completedView && orderIsCompleted && !isCompleting && !isLeavingRef.current) {
    return <Navigate to={`/completed/orders/${order.id}`} replace />
  }

  const imageSources = order.referenceImages ?? []

  return (
    <>
      <PageLayout
        title="Cake Order Details"
        subtitle={formatCakeLabel(order.flavor, order.size)}
        backTo={backTo}
        actions={
          completedView ? (
            <button
              type="button"
              className="btn-reopen"
              onClick={() => setShowReopenConfirm(true)}
            >
              Reopen
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-complete"
                onClick={() => setShowCompleteConfirm(true)}
              >
                Complete
              </button>
              <button
                type="button"
                className="btn-delete"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </button>
              <Link to={`/orders/${order.id}/edit`} className="btn-edit">
                Edit Order
              </Link>
            </>
          )
        }
      >
        {actionError ? <p className="detail-delete-error">{actionError}</p> : null}
        <section className="order-detail-card">
          <dl className="detail-grid">
            <div>
              <dt>Customer</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div>
              <dt>Flavor</dt>
              <dd>{order.flavor}</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>{order.size}</dd>
            </div>
            <div>
              <dt>Order Type</dt>
              <dd>{order.orderType === 'delivery' ? 'Delivery' : 'Pick up'}</dd>
            </div>
            {order.orderType === 'delivery' ? (
              <>
                <div>
                  <dt>Delivery</dt>
                  <dd>
                    {formatPickupDateLabel(order.deliveryDate)} at{' '}
                    {formatPickupTime(order.deliveryTime)}
                  </dd>
                </div>
                <div className="detail-full">
                  <dt>Delivery Address</dt>
                  <dd>{order.deliveryAddress}</dd>
                </div>
              </>
            ) : (
              <div>
                <dt>Pickup</dt>
                <dd>
                  {formatPickupDateLabel(order.pickupDate)} at {formatPickupTime(order.pickupTime)}
                </dd>
              </div>
            )}
            <div>
              <dt>Total</dt>
              <dd>₹{order.total.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Advance Paid</dt>
              <dd>₹{order.advancePaid.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Pending</dt>
              <dd>₹{order.pending.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Order Taken By</dt>
              <dd>{order.orderTakenBy}</dd>
            </div>
            {order.greetings ? (
              <div className="detail-full">
                <dt>Greetings</dt>
                <dd>{order.greetings}</dd>
              </div>
            ) : null}
            {order.modifications ? (
              <div className="detail-full">
                <dt>Modifications</dt>
                <dd>{order.modifications}</dd>
              </div>
            ) : null}
            {imageSources.length ? (
              <div className="detail-full detail-reference-images">
                <dt>Reference Images</dt>
                <dd className="reference-image-list">
                  {imageSources.map((src, index) => (
                    <img
                      key={`${src}-${index}`}
                      src={src}
                      alt={`Reference cake ${index + 1}`}
                      className="reference-image"
                    />
                  ))}
                </dd>
              </div>
            ) : order.referenceImageName ? (
              <div className="detail-full">
                <dt>Reference Image</dt>
                <dd>{order.referenceImageName}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      </PageLayout>

      {showDeleteConfirm ? (
        <ConfirmDialog
          title="Delete this order?"
          message={`Are you sure you want to delete ${order.customerName}'s order?`}
          confirmLabel="Yes"
          loadingLabel="Deleting..."
          confirmVariant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            if (!isDeleting) setShowDeleteConfirm(false)
          }}
          isLoading={isDeleting}
        />
      ) : null}

      {showCompleteConfirm ? (
        <ConfirmDialog
          title="Mark order completed?"
          message={`Are you sure ${order.customerName}'s order is completed?`}
          confirmLabel="Complete"
          loadingLabel="Completing..."
          confirmVariant="success"
          onConfirm={handleConfirmComplete}
          onCancel={() => {
            if (!isCompleting) setShowCompleteConfirm(false)
          }}
          isLoading={isCompleting}
        />
      ) : null}

      {showReopenConfirm ? (
        <ConfirmDialog
          title="Reopen this order?"
          message={`Are you sure you want to reopen ${order.customerName}'s order?`}
          confirmLabel="Reopen"
          loadingLabel="Reopening..."
          confirmVariant="primary"
          onConfirm={handleConfirmReopen}
          onCancel={() => {
            if (!isReopening) setShowReopenConfirm(false)
          }}
          isLoading={isReopening}
        />
      ) : null}
    </>
  )
}

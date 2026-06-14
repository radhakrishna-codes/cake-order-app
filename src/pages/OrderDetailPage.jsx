import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import OrderPreparationStatusBadge from '../components/OrderPreparationStatusBadge'
import OrderPreparationStatusSelect from '../components/OrderPreparationStatusSelect'
import PageLayout from '../components/PageLayout'
import ReferenceImageLightbox from '../components/ReferenceImageLightbox'
import { useOrders } from '../context/OrdersContext'
import {
  formatCakeLabel,
  formatPickupDateLabel,
  formatPickupTime,
  getDisplayPreparationStatus,
  isCompletedOrder,
} from '../utils/orderUtils'
import './OrderDetailPage.css'

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const {
    getOrderById,
    fetchOrderById,
    deleteOrder,
    updatePreparationStatus,
    refreshOrders,
    loading: ordersLoading,
  } = useOrders()
  const [order, setOrder] = useState(() => getOrderById(orderId))
  const [loading, setLoading] = useState(!order)
  const [error, setError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const isLeavingRef = useRef(false)

  const lightboxImages = useMemo(
    () =>
      (order?.referenceImages ?? []).map((src, index) => ({
        src,
        alt: `Reference cake ${index + 1}`,
      })),
    [order?.referenceImages],
  )

  useEffect(() => {
    isLeavingRef.current = false
  }, [orderId])

  useEffect(() => {
    const cached = getOrderById(orderId)
    if (cached) setOrder(cached)
  }, [orderId, getOrderById])

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

  async function handlePreparationStatusChange(nextStatus) {
    setActionError(null)

    try {
      const updated = await updatePreparationStatus(order.id, nextStatus)
      setOrder(updated)

      if (nextStatus === 'completed') {
        navigate('/', {
          replace: true,
          state: {
            successMessage: `${order.customerName}'s order has been marked as completed`,
          },
        })
        refreshOrders({ silent: true })
      }
    } catch (err) {
      setActionError(err.message ?? 'Failed to update status')
      throw err
    }
  }

  const isActionInProgress = isDeleting

  if ((loading || ordersLoading) && !isActionInProgress) {
    return (
      <PageLayout title="Cake Order Details" backTo="/">
        <p className="page-message">Loading order...</p>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout title="Cake Order Details" backTo="/">
        <p className="page-message page-message-error">{error}</p>
      </PageLayout>
    )
  }

  if (!order) {
    return <Navigate to="/" replace />
  }

  const displayStatus = getDisplayPreparationStatus(order)
  const orderIsCompleted = isCompletedOrder(order)
  const imageSources = order.referenceImages ?? []

  return (
    <>
      <PageLayout
        title="Cake Order Details"
        subtitle={formatCakeLabel(order.flavor, order.size)}
        backTo="/"
        actions={
          <>
            <OrderPreparationStatusSelect
              orderType={order.orderType}
              value={displayStatus}
              onChange={handlePreparationStatusChange}
            />
            {!orderIsCompleted ? (
              <>
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
            ) : null}
          </>
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
              <dt>Status</dt>
              <dd>
                <OrderPreparationStatusBadge status={displayStatus} />
              </dd>
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
                <dt>Instructions</dt>
                <dd>{order.modifications}</dd>
              </div>
            ) : null}
            {imageSources.length ? (
              <div className="detail-full detail-reference-images">
                <dt>Reference Images</dt>
                <dd>
                  <div className="reference-image-list">
                    {imageSources.map((src, index) => (
                      <button
                        key={`${src}-${index}`}
                        type="button"
                        className="reference-image-button"
                        onClick={() => setLightboxIndex(index)}
                        aria-label={`View reference cake ${index + 1}`}
                      >
                        <img
                          src={src}
                          alt={`Reference cake ${index + 1}`}
                          className="reference-image"
                        />
                      </button>
                    ))}
                  </div>
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

      <ReferenceImageLightbox
        images={lightboxImages}
        openIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />

      {showDeleteConfirm ? (
        <ConfirmDialog
          title="Delete this order?"
          message={`Are you sure you want to delete ${order.customerName}'s order?`}
          confirmLabel="Delete"
          loadingLabel="Deleting..."
          confirmVariant="danger"
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

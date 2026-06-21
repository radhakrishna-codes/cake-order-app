import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Card } from '@mui/material'
import ConfirmDialog from '../components/ConfirmDialog'
import OrderPreparationStatusBadge from '../components/OrderPreparationStatusBadge'
import PageLayout from '../components/PageLayout'
import ReferenceImageLightbox from '../components/ReferenceImageLightbox'
import { useOrders } from '../context/OrdersContext'
import {
  formatCakeLabel,
  formatCurrency,
  formatDateTimeLabel,
  formatPickupDateLabel,
  formatPickupTime,
  getDisplayPreparationStatus,
  HOME_STATUS_FILTERS,
  isCompletedOrder,
} from '../utils/orderUtils'
import './OrderDetailPage.css'

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { fetchOrderById, deleteOrder, refreshOrders } = useOrders()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
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

  async function handleConfirmDelete() {
    setIsDeleting(true)
    setActionError(null)
    try {
      await deleteOrder(order.id)
      isLeavingRef.current = true
      setShowDeleteConfirm(false)
      navigate('/', { replace: true })
      refreshOrders({ silent: true, statusFilter: HOME_STATUS_FILTERS.all })
    } catch (err) {
      setActionError(err.message ?? 'Failed to delete order')
      setIsDeleting(false)
    }
  }

  const isActionInProgress = isDeleting

  if (loading && !isActionInProgress) {
    return (
      <PageLayout title="Cake Order Details" backTo="/">
        <Alert severity="info">Loading order...</Alert>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout title="Cake Order Details" backTo="/">
        <Alert severity="error">{error}</Alert>
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
            {!orderIsCompleted ? (
              <>
                <Button
                  type="button"
                  variant="rrDangerGhost"
                  size="small"
                  onClick={() => setShowDeleteConfirm(true)}
                  sx={{ px: 1.5, py: 0.55, minHeight: 34 }}
                >
                  Delete
                </Button>
                <Button
                  component={Link}
                  to={`/orders/${order.id}/edit`}
                  variant="rrGold"
                  size="small"
                  sx={{ px: 1.5, py: 0.55, minHeight: 34 }}
                >
                  Edit Order
                </Button>
              </>
            ) : null}
          </>
        }
      >
        {actionError ? (
          <Alert severity="error" className="detail-delete-error">
            {actionError}
          </Alert>
        ) : null}
        <Card className="order-detail-card" variant="rrSurface" elevation={0}>
          <dl className="detail-grid">
            <div>
              <dt>Customer</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div>
              <dt>Phone Number</dt>
              <dd>{order.customerPhoneNumber || 'N/A'}</dd>
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
              <dd>{formatCurrency(order.total)}</dd>
            </div>
            <div>
              <dt>Advance Paid</dt>
              <dd>{formatCurrency(order.advancePaid)}</dd>
            </div>
            <div>
              <dt>Pending</dt>
              <dd>{formatCurrency(order.pending)}</dd>
            </div>
            <div>
              <dt>Order Taken By</dt>
              <dd>{order.orderTakenBy}</dd>
            </div>
            <div>
              <dt>Created By</dt>
              <dd>
                {order.createdBy || order.orderTakenBy} ({formatDateTimeLabel(order.createdAt)})
              </dd>
            </div>
            <div>
              <dt>Updated By</dt>
              <dd>
                {order.updatedBy || order.orderTakenBy} ({formatDateTimeLabel(order.updatedAt)})
              </dd>
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
        </Card>
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

import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { useOrders } from '../context/OrdersContext'
import { formatCakeLabel, formatPickupDateLabel, formatPickupTime } from '../utils/orderUtils'
import './OrderDetailPage.css'

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const { getOrderById, fetchOrderById, loading: ordersLoading } = useOrders()
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

  if (loading || ordersLoading) {
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

  const imageSources = order.referenceImages ?? []

  return (
    <PageLayout
      title="Cake Order Details"
      subtitle={formatCakeLabel(order.flavor, order.size)}
      backTo="/"
      actions={
        <Link to={`/orders/${order.id}/edit`} className="btn-edit">
          Edit Order
        </Link>
      }
    >
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
  )
}

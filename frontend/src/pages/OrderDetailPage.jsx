import { Link, Navigate, useParams } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { useOrders } from '../context/OrdersContext'
import { formatCakeLabel, formatPickupDateLabel, formatPickupTime } from '../utils/orderUtils'
import './OrderDetailPage.css'

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const { getOrderById } = useOrders()
  const order = getOrderById(orderId)

  if (!order) {
    return <Navigate to="/" replace />
  }

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
            <dt>Pickup</dt>
            <dd>
              {formatPickupDateLabel(order.pickupDate)} at {formatPickupTime(order.pickupTime)}
            </dd>
          </div>
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
          {order.referenceImages?.length ? (
            <div className="detail-full detail-reference-images">
              <dt>Reference Images</dt>
              <dd className="reference-image-list">
                {order.referenceImages.map((src, index) => (
                  <img
                    key={src}
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

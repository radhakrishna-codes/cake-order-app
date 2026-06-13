import { Link } from 'react-router-dom'
import logo from '../assets/rajaranilogo.png'
import { useOrders } from '../context/OrdersContext'
import {
  formatCakeLabel,
  formatPickupTime,
  getOrderScheduleTime,
  groupOrdersByPickupDate,
  isCompletedOrder,
} from '../utils/orderUtils'
import './HomePage.css'

export default function CompletedOrdersPage() {
  const { orders, orderCounts, loading, error, refreshOrders } = useOrders()
  const completedOrders = orders.filter(isCompletedOrder)
  const grouped = groupOrdersByPickupDate(completedOrders)

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-brand">
          <img src={logo} alt="Raja Rani Bakery & Restaurant" className="home-logo" />
          <div>
            <h1>Completed Cake Orders</h1>
            <p className="home-subtitle">Finished orders by schedule date</p>
          </div>
        </div>
        <div className="home-header-actions">
          <Link to="/" className="btn-completed-orders">
            Active Orders ({orderCounts.inProgress})
          </Link>
        </div>
      </header>

      <section className="orders-list" aria-label="Completed cake orders by date">
        {loading ? (
          <p className="orders-empty">Loading orders...</p>
        ) : error ? (
          <div className="orders-empty orders-error">
            <p>{error}</p>
            <button type="button" className="btn-retry" onClick={refreshOrders}>
              Try again
            </button>
          </div>
        ) : grouped.length === 0 ? (
          <p className="orders-empty">No completed orders yet.</p>
        ) : (
          grouped.map((group) => (
            <article key={group.pickupDate} className="pickup-group">
              <h2 className="pickup-heading">{group.pickupLabel}</h2>
              <ol className="cake-items">
                {group.items.map((order) => (
                  <li key={order.id}>
                    <Link to={`/completed/orders/${order.id}`} className="cake-item-button">
                      <span className="cake-item-label">
                        {formatCakeLabel(order.flavor, order.size)}
                      </span>
                      <span className="cake-item-meta">
                        <span className="cake-item-customer">{order.customerName}</span>
                        <span className="cake-item-time">
                          {formatPickupTime(getOrderScheduleTime(order))}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </article>
          ))
        )}
      </section>
    </div>
  )
}

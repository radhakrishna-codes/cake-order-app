import { Link } from 'react-router-dom'
import logo from '../assets/rajaranilogo.png'
import { useOrders } from '../context/OrdersContext'
import { formatCakeLabel, formatPickupTime, groupOrdersByPickupDate } from '../utils/orderUtils'
import './HomePage.css'

export default function HomePage() {
  const { orders } = useOrders()
  const grouped = groupOrdersByPickupDate(orders)

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-brand">
          <img src={logo} alt="Raja Rani Bakery & Restaurant" className="home-logo" />
          <div>
            <h1>Cake Orders</h1>
            <p className="home-subtitle">Pickup schedule by date</p>
          </div>
        </div>
        <Link to="/orders/new" className="btn-create-order">
          Create Cake Order
        </Link>
      </header>

      <section className="orders-list" aria-label="Cake orders by pickup date">
        {grouped.length === 0 ? (
          <p className="orders-empty">No cake orders yet. Create your first order.</p>
        ) : (
          grouped.map((group) => (
            <article key={group.pickupDate} className="pickup-group">
              <h2 className="pickup-heading">Pickup: {group.pickupLabel}</h2>
              <ol className="cake-items">
                {group.items.map((order) => (
                  <li key={order.id}>
                    <Link to={`/orders/${order.id}`} className="cake-item-button">
                      <span className="cake-item-label">
                        {formatCakeLabel(order.flavor, order.size)}
                      </span>
                      <span className="cake-item-meta">
                        <span className="cake-item-customer">{order.customerName}</span>
                        <span className="cake-item-time">
                          {formatPickupTime(order.pickupTime)}
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

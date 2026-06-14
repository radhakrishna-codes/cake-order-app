import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/rajaranilogo.png'
import OrderPreparationStatusBadge from '../components/OrderPreparationStatusBadge'
import SuccessBanner from '../components/SuccessBanner'
import { useOrders } from '../context/OrdersContext'
import {
  formatCakeLabel,
  formatPickupTime,
  getDisplayPreparationStatus,
  getHomeStatusFilterCounts,
  getOrderScheduleTime,
  groupOrdersByPickupDate,
  HOME_STATUS_FILTERS,
  matchesHomeStatusFilter,
} from '../utils/orderUtils'
import './HomePage.css'

const STATUS_FILTER_TABS = [
  { id: HOME_STATUS_FILTERS.all, label: 'All' },
  { id: HOME_STATUS_FILTERS.inProgress, label: 'In progress' },
  { id: HOME_STATUS_FILTERS.ready, label: 'Ready for pickup' },
  { id: HOME_STATUS_FILTERS.completed, label: 'Completed' },
]

const EMPTY_STATES = {
  [HOME_STATUS_FILTERS.all]: {
    message: 'No cake orders yet.',
    hint: 'Add a new cake order to start tracking prep, pickup, and delivery.',
  },
  [HOME_STATUS_FILTERS.inProgress]: {
    message: 'No orders in progress.',
    hint: 'Create a cake order when a customer places a new request.',
  },
  [HOME_STATUS_FILTERS.ready]: {
    message: 'No orders ready for pickup.',
    hint: 'Orders marked ready for pick up or delivery will appear here.',
  },
  [HOME_STATUS_FILTERS.completed]: {
    message: 'No completed orders yet.',
    hint: 'Create a new cake order or mark an active order as completed when it is finished.',
  },
}

export default function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { orders, loading, error, refreshOrders } = useOrders()
  const [successMessage, setSuccessMessage] = useState(null)
  const [activeFilter, setActiveFilter] = useState(HOME_STATUS_FILTERS.all)

  const filterCounts = useMemo(() => getHomeStatusFilterCounts(orders), [orders])

  const filteredOrders = useMemo(
    () => orders.filter((order) => matchesHomeStatusFilter(order, activeFilter)),
    [orders, activeFilter],
  )

  const grouped = groupOrdersByPickupDate(filteredOrders)

  useEffect(() => {
    const message = location.state?.successMessage
    if (!message) return

    setSuccessMessage(message)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state?.successMessage, navigate])

  return (
    <div className="home-page">
      <SuccessBanner message={successMessage} onDismiss={() => setSuccessMessage(null)} />
      <header className="home-header">
        <div className="home-header-top">
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
        </div>
      </header>

      <nav className="home-status-filters" aria-label="Filter orders by status">
        {STATUS_FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`home-status-filter ${activeFilter === tab.id ? 'is-active' : ''}`}
            aria-pressed={activeFilter === tab.id}
            onClick={() => setActiveFilter(tab.id)}
          >
            <span className="home-status-filter-label">{tab.label}</span>
            <span className="home-status-filter-count">{filterCounts[tab.id]}</span>
          </button>
        ))}
      </nav>

      <section className="orders-list" aria-label="Cake orders by pickup date">
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
          <div className="orders-empty orders-empty-state">
            <p className="orders-empty-message">{EMPTY_STATES[activeFilter].message}</p>
            <p className="orders-empty-hint">{EMPTY_STATES[activeFilter].hint}</p>
            {EMPTY_STATES[activeFilter].showCreate !== false ? (
              <Link to="/orders/new" className="btn-create-order orders-empty-create">
                Create Cake Order
              </Link>
            ) : null}
          </div>
        ) : (
          grouped.map((group) => (
            <article key={group.pickupDate} className="pickup-group">
              <h2 className="pickup-heading">{group.pickupLabel}</h2>
              <ol className="cake-items">
                {group.items.map((order) => (
                  <li key={order.id}>
                    <Link to={`/orders/${order.id}`} className="cake-item-button">
                      <span className="cake-item-top">
                        <span className="cake-item-customer">{order.customerName}</span>
                        <span className="cake-item-time">
                          {formatPickupTime(getOrderScheduleTime(order))}
                        </span>
                        <OrderPreparationStatusBadge status={getDisplayPreparationStatus(order)} />
                      </span>
                      <span className="cake-item-label">
                        {formatCakeLabel(order.flavor, order.size)}
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

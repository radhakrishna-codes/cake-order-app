import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import logo from '../assets/rajaranilogo-160.png'
import OrderPreparationStatusBadge from '../components/OrderPreparationStatusBadge'
import SuccessBanner from '../components/SuccessBanner'
import { useOrders } from '../context/OrdersContext'
import {
  formatCakeLabel,
  formatPickupTime,
  getDisplayPreparationStatus,
  getOrderScheduleTime,
  groupOrdersByPickupDate,
  HOME_STATUS_FILTERS,
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
  const { orders, filterCounts, loading, error, refreshOrders } = useOrders()
  const [successMessage, setSuccessMessage] = useState(null)
  const [activeFilter, setActiveFilter] = useState(HOME_STATUS_FILTERS.all)

  useEffect(() => {
    refreshOrders({ statusFilter: activeFilter })
  }, [activeFilter, refreshOrders])

  const grouped = groupOrdersByPickupDate(orders)

  function handleFilterSelect(filterId) {
    if (activeFilter === filterId) {
      refreshOrders({ statusFilter: filterId })
      return
    }
    setActiveFilter(filterId)
  }

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
            <img
              src={logo}
              alt="Raja Rani Bakery & Restaurant"
              className="home-logo"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <Box>
              <Typography
                component="h1"
                sx={{
                  m: 0,
                  fontSize: 'clamp(1.35rem, 3.5vw, 1.75rem)',
                  color: 'var(--rr-gold-light)',
                  letterSpacing: '-0.02em',
                }}
              >
                Cake Orders
              </Typography>
              <Typography
                sx={{
                  mt: '0.25rem',
                  fontSize: '0.9rem',
                  color: 'var(--rr-gold-mid)',
                }}
              >
                Pickup schedule by date
              </Typography>
            </Box>
          </div>
          <Button
            component={Link}
            to="/orders/new"
            variant="rrGold"
            sx={{
              px: 2,
              py: 0.9,
              flexShrink: 0,
              width: { xs: '100%', sm: 'auto' },
              '&:hover': { transform: 'translateY(-1px)' },
            }}
          >
            Create Cake Order
          </Button>
        </div>
      </header>

      <nav className="home-status-filters" aria-label="Filter orders by status">
        <ToggleButtonGroup
          exclusive
          value={activeFilter}
          onChange={(_, value) => {
            if (value) handleFilterSelect(value)
          }}
          aria-label="Filter orders by status"
          sx={{ flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}
        >
          {STATUS_FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id
            return (
              <ToggleButton
                key={tab.id}
                value={tab.id}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  minWidth: '9.5rem',
                  border: '2px solid var(--rr-gold-dark)',
                  borderRadius: '12px !important',
                  px: 1.7,
                  py: 1,
                  fontSize: '1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: 'var(--rr-black)',
                  background: isActive
                    ? 'linear-gradient(180deg, var(--rr-gold) 0%, var(--rr-gold-dark) 100%)'
                    : 'var(--rr-card)',
                  boxShadow: isActive
                    ? '0 6px 18px rgba(26, 26, 26, 0.25)'
                    : '0 4px 14px var(--rr-shadow)',
                  '&:hover': {
                    background: isActive
                      ? 'linear-gradient(180deg, var(--rr-gold) 0%, var(--rr-gold-dark) 100%)'
                      : '#fffef8',
                    borderColor: 'var(--rr-gold)',
                  },
                }}
              >
                <span>{tab.label}</span>
                <Chip
                  size="small"
                  label={filterCounts[tab.id]}
                  sx={{
                    height: 24,
                    fontWeight: 800,
                    background: isActive ? 'rgba(26, 26, 26, 0.18)' : 'rgba(56, 51, 51, 0.1)',
                    color: 'inherit',
                  }}
                />
              </ToggleButton>
            )
          })}
        </ToggleButtonGroup>
      </nav>

      <section className="orders-list" aria-label="Cake orders by pickup date">
        {loading ? (
          <Typography className="orders-empty">Loading orders...</Typography>
        ) : error ? (
          <Stack className="orders-empty orders-error">
            <Typography>{error}</Typography>
            <Button
              type="button"
              onClick={() => refreshOrders({ statusFilter: activeFilter })}
              variant="rrGold"
              sx={{ px: 2, py: 0.8, fontWeight: 600 }}
            >
              Try again
            </Button>
          </Stack>
        ) : grouped.length === 0 ? (
          <Stack className="orders-empty orders-empty-state">
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--rr-black)' }}>
              {EMPTY_STATES[activeFilter].message}
            </Typography>
            <Typography sx={{ maxWidth: '26rem', fontSize: '0.92rem', lineHeight: 1.45, color: 'var(--rr-text-muted)' }}>
              {EMPTY_STATES[activeFilter].hint}
            </Typography>
            {EMPTY_STATES[activeFilter].showCreate !== false ? (
              <Button
                component={Link}
                to="/orders/new"
                variant="rrGold"
                sx={{ mt: 0.5, px: 2, py: 0.9 }}
              >
                Create Cake Order
              </Button>
            ) : null}
          </Stack>
        ) : (
          grouped.map((group) => (
            <Card
              key={group.pickupDate}
              className="pickup-group"
              variant="rrSurface"
              component="article"
              elevation={0}
            >
              <Typography component="h2" className="pickup-heading">
                {group.pickupLabel}
              </Typography>
              <CardContent sx={{ pt: 0, px: '0.75rem', pb: '1rem !important' }}>
                <Stack component="ol" className="cake-items">
                  {group.items.map((order) => (
                    <Box component="li" key={order.id}>
                      <Box component={Link} to={`/orders/${order.id}`} className="cake-item-button">
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
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  )
}

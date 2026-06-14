import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as ordersApi from '../api/ordersApi'
import { HOME_STATUS_FILTERS } from '../utils/orderUtils'

const EMPTY_FILTER_COUNTS = {
  [HOME_STATUS_FILTERS.all]: 0,
  [HOME_STATUS_FILTERS.inProgress]: 0,
  [HOME_STATUS_FILTERS.ready]: 0,
  [HOME_STATUS_FILTERS.completed]: 0,
}

const OrdersContext = createContext(null)

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([])
  const [filterCounts, setFilterCounts] = useState(EMPTY_FILTER_COUNTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refreshOrders = useCallback(async ({ silent = false, statusFilter = HOME_STATUS_FILTERS.all } = {}) => {
    if (!silent) {
      setLoading(true)
      setError(null)
    }
    try {
      const data = await ordersApi.listOrders({ statusFilter })
      setOrders(data.orders)
      setFilterCounts(data.counts)
    } catch (err) {
      if (!silent) {
        setError(err.message ?? 'Failed to load orders')
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [])

  const addOrder = useCallback(async (orderData) => {
    const created = await ordersApi.createOrder(orderData)
    setOrders((current) => [...current, created])
    return created
  }, [])

  const updateOrder = useCallback(async (id, orderData) => {
    const updated = await ordersApi.updateOrder(id, orderData)
    setOrders((current) => current.map((order) => (order.id === id ? updated : order)))
    return updated
  }, [])

  const deleteOrder = useCallback(async (id) => {
    await ordersApi.deleteOrder(id)
    setOrders((current) => current.filter((order) => order.id !== id))
  }, [])

  const updatePreparationStatus = useCallback(async (id, preparationStatus) => {
    const updated = await ordersApi.updatePreparationStatus(id, preparationStatus)
    setOrders((current) => current.map((order) => (order.id === id ? updated : order)))
    return updated
  }, [])

  const fetchOrderById = useCallback(async (id) => {
    const fetched = await ordersApi.getOrder(id)
    setOrders((current) => {
      const exists = current.some((order) => order.id === id)
      return exists
        ? current.map((order) => (order.id === id ? fetched : order))
        : [...current, fetched]
    })
    return fetched
  }, [])

  const value = useMemo(
    () => ({
      orders,
      filterCounts,
      loading,
      error,
      refreshOrders,
      addOrder,
      updateOrder,
      deleteOrder,
      updatePreparationStatus,
      fetchOrderById,
    }),
    [
      orders,
      filterCounts,
      loading,
      error,
      refreshOrders,
      addOrder,
      updateOrder,
      deleteOrder,
      updatePreparationStatus,
      fetchOrderById,
    ],
  )

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider')
  }
  return context
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as ordersApi from '../api/ordersApi'

const OrdersContext = createContext(null)

const EMPTY_COUNTS = { inProgress: 0, completed: 0 }

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([])
  const [orderCounts, setOrderCounts] = useState(EMPTY_COUNTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refreshCounts = useCallback(async () => {
    const counts = await ordersApi.getOrderCounts()
    setOrderCounts(counts)
    return counts
  }, [])

  const refreshOrders = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true)
      setError(null)
    }
    try {
      const [data, counts] = await Promise.all([
        ordersApi.listOrders(),
        ordersApi.getOrderCounts(),
      ])
      setOrders(data)
      setOrderCounts(counts)
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

  useEffect(() => {
    refreshOrders()
  }, [refreshOrders])

  const addOrder = useCallback(async (orderData) => {
    const created = await ordersApi.createOrder(orderData)
    setOrders((current) => [...current, created])
    await refreshCounts()
    return created
  }, [refreshCounts])

  const updateOrder = useCallback(async (id, orderData) => {
    const updated = await ordersApi.updateOrder(id, orderData)
    setOrders((current) => current.map((order) => (order.id === id ? updated : order)))
    return updated
  }, [])

  const deleteOrder = useCallback(async (id) => {
    await ordersApi.deleteOrder(id)
    setOrders((current) => current.filter((order) => order.id !== id))
    await refreshCounts()
  }, [refreshCounts])

  const completeOrder = useCallback(async (id) => {
    const updated = await ordersApi.completeOrder(id)
    setOrders((current) => current.map((order) => (order.id === id ? updated : order)))
    await refreshCounts()
    return updated
  }, [refreshCounts])

  const reopenOrder = useCallback(async (id) => {
    const updated = await ordersApi.reopenOrder(id)
    setOrders((current) => current.map((order) => (order.id === id ? updated : order)))
    await refreshCounts()
    return updated
  }, [refreshCounts])

  const fetchOrderById = useCallback(async (id) => {
    const cached = orders.find((order) => order.id === id)
    if (cached) return cached

    const fetched = await ordersApi.getOrder(id)
    setOrders((current) => {
      const exists = current.some((order) => order.id === id)
      return exists
        ? current.map((order) => (order.id === id ? fetched : order))
        : [...current, fetched]
    })
    return fetched
  }, [orders])

  const getOrderById = useCallback(
    (id) => orders.find((order) => order.id === id) ?? null,
    [orders],
  )

  const value = useMemo(
    () => ({
      orders,
      orderCounts,
      loading,
      error,
      refreshOrders,
      addOrder,
      updateOrder,
      deleteOrder,
      completeOrder,
      reopenOrder,
      fetchOrderById,
      getOrderById,
    }),
    [
      orders,
      orderCounts,
      loading,
      error,
      refreshOrders,
      addOrder,
      updateOrder,
      deleteOrder,
      completeOrder,
      reopenOrder,
      fetchOrderById,
      getOrderById,
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

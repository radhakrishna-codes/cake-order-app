import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { DUMMY_ORDERS } from '../data/dummyOrders'
import { createOrderId } from '../utils/orderUtils'

const OrdersContext = createContext(null)

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(DUMMY_ORDERS)

  const addOrder = useCallback((orderData) => {
    const newOrder = { ...orderData, id: createOrderId() }
    setOrders((current) => [...current, newOrder])
    return newOrder
  }, [])

  const updateOrder = useCallback((id, orderData) => {
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...orderData, id } : order)),
    )
  }, [])

  const getOrderById = useCallback(
    (id) => orders.find((order) => order.id === id) ?? null,
    [orders],
  )

  const value = useMemo(
    () => ({ orders, addOrder, updateOrder, getOrderById }),
    [orders, addOrder, updateOrder, getOrderById],
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

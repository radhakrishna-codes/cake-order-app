import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { OrdersProvider } from './context/OrdersContext'
import CreateOrderPage from './pages/CreateOrderPage'
import EditOrderPage from './pages/EditOrderPage'
import HomePage from './pages/HomePage'
import OrderDetailPage from './pages/OrderDetailPage'
import './App.css'

function CompletedOrderRedirect() {
  const { orderId } = useParams()
  return <Navigate to={`/orders/${orderId}`} replace />
}

function App() {
  return (
    <OrdersProvider>
      <BrowserRouter>
        <main className="app-shell">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/orders/new" element={<CreateOrderPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            <Route path="/orders/:orderId/edit" element={<EditOrderPage />} />
            <Route path="/completed" element={<Navigate to="/" replace />} />
            <Route path="/completed/orders/:orderId" element={<CompletedOrderRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </OrdersProvider>
  )
}

export default App

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { OrdersProvider } from './context/OrdersContext'
import CompletedOrdersPage from './pages/CompletedOrdersPage'
import CreateOrderPage from './pages/CreateOrderPage'
import EditOrderPage from './pages/EditOrderPage'
import HomePage from './pages/HomePage'
import OrderDetailPage from './pages/OrderDetailPage'
import './App.css'

function App() {
  return (
    <OrdersProvider>
      <BrowserRouter>
        <main className="app-shell">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/completed" element={<CompletedOrdersPage />} />
            <Route path="/orders/new" element={<CreateOrderPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            <Route path="/completed/orders/:orderId" element={<OrderDetailPage completedView />} />
            <Route path="/orders/:orderId/edit" element={<EditOrderPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </OrdersProvider>
  )
}

export default App

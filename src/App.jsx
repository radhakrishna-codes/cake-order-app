import { lazy, Suspense } from 'react'
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { Box, CircularProgress, Typography } from '@mui/material'
import { OrdersProvider } from './context/OrdersContext'
import './App.css'

const HomePage = lazy(() => import('./pages/HomePage'))
const CreateOrderPage = lazy(() => import('./pages/CreateOrderPage'))
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'))
const EditOrderPage = lazy(() => import('./pages/EditOrderPage'))

function CompletedOrderRedirect() {
  const { orderId } = useParams()
  return <Navigate to={`/orders/${orderId}`} replace />
}

function RouteFallback() {
  return (
    <Box
      sx={{
        minHeight: '40vh',
        display: 'grid',
        placeItems: 'center',
        gap: 1,
      }}
    >
      <CircularProgress size={26} />
      <Typography variant="body2" color="text.secondary">
        Loading page...
      </Typography>
    </Box>
  )
}

function App() {
  const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter

  return (
    <OrdersProvider>
      <Router>
        <main className="app-shell">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/orders/new" element={<CreateOrderPage />} />
              <Route path="/orders/:orderId" element={<OrderDetailPage />} />
              <Route path="/orders/:orderId/edit" element={<EditOrderPage />} />
              <Route path="/completed" element={<Navigate to="/" replace />} />
              <Route path="/completed/orders/:orderId" element={<CompletedOrderRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </Router>
    </OrdersProvider>
  )
}

export default App

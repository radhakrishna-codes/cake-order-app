import { Navigate, useNavigate, useParams } from 'react-router-dom'
import CakeOrderForm from '../components/CakeOrderForm'
import PageLayout from '../components/PageLayout'
import { useOrders } from '../context/OrdersContext'
import { formatCakeLabel } from '../utils/orderUtils'

export default function EditOrderPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { getOrderById, updateOrder } = useOrders()
  const order = getOrderById(orderId)

  if (!order) {
    return <Navigate to="/" replace />
  }

  function handleSave(orderData) {
    updateOrder(order.id, orderData)
    navigate(`/orders/${order.id}`)
  }

  return (
    <PageLayout
      title="Edit Cake Order"
      subtitle={formatCakeLabel(order.flavor, order.size)}
      backTo={`/orders/${order.id}`}
    >
      <CakeOrderForm
        mode="edit"
        initialOrder={order}
        onCancel={() => navigate(`/orders/${order.id}`)}
        onSave={handleSave}
      />
    </PageLayout>
  )
}

import { useNavigate } from 'react-router-dom'
import CakeOrderForm from '../components/CakeOrderForm'
import PageLayout from '../components/PageLayout'
import { useOrders } from '../context/OrdersContext'

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const { addOrder } = useOrders()

  function handleSave(orderData) {
    const order = addOrder(orderData)
    navigate(`/orders/${order.id}`)
  }

  return (
    <PageLayout title="New Cake Order" subtitle="Create a customer cake order" backTo="/">
      <CakeOrderForm
        mode="create"
        onCancel={() => navigate('/')}
        onSave={handleSave}
      />
    </PageLayout>
  )
}

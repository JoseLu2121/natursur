// src/OrdersPage.jsx
import { useState, useEffect } from 'react'
import { getAllOrders } from './api/products'
import LoadingSpinner from './components/LoadingSpinner'
import ManualOrderForm from './components/ManualOrderForm'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showManualForm, setShowManualForm] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await getAllOrders()
      setOrders(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (cents) => (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
  const formatDate = (dateStr) => new Date(dateStr).toLocaleString('es-ES')

  if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner size={6} className="text-primary-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Pedidos</h1>
          <p className="mt-1 text-sm text-gray-600">Visualiza y registra nuevos pedidos.</p>
        </div>
        <button
          onClick={() => setShowManualForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          + Nuevo Pedido Manual
        </button>
      </div>

      {showManualForm && (
        <ManualOrderForm 
          onOrderCreated={() => {
            setShowManualForm(false)
            fetchOrders()
          }}
          onCancel={() => setShowManualForm(false)}
        />
      )}

      <div className="overflow-hidden bg-white shadow sm:rounded-lg border border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {orders.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">No hay pedidos registrados.</li>
          ) : (
            orders.map((order) => (
              <li key={order.id} className="px-4 py-5 sm:px-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-primary-700">
                        Pedido #{order.id.slice(0, 8)}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {order.status === 'pending' ? 'Pendiente' : order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Cliente: <span className="font-semibold text-gray-900">{order.users?.full_name || 'Desconocido'}</span> 
                      <span className="mx-2">•</span> 
                      {formatDate(order.created_at)}
                    </p>
                    {order.users?.email && <p className="text-xs text-gray-400">{order.users.email}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{formatPrice(order.total_cents)}</p>
                  </div>
                </div>

                {/* Lista de productos del pedido */}
                <div className="bg-gray-50 rounded-md p-3">
                  <ul className="space-y-2">
                    {order.order_items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          <span className="font-bold">{item.quantity}x</span> {item.products?.name || 'Producto eliminado'}
                        </span>
                        <span className="text-gray-500">
                          {formatPrice(item.unit_price_cents * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
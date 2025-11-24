// src/OrdersPage.jsx
import { useState, useEffect } from 'react'
import { getAllOrders, updateOrderStatus, deleteOrder } from './api/products'
import LoadingSpinner from './components/LoadingSpinner'
import ManualOrderForm from './components/ManualOrderForm'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showManualForm, setShowManualForm] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [deletingOrderId, setDeletingOrderId] = useState(null)

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

  const handleCompleteOrder = async (orderId) => {
    try {
      setUpdatingOrderId(orderId)
      await updateOrderStatus(orderId, 'completed')
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'completed' } : order
      ))
    } catch (error) {
      alert('Error al actualizar pedido: ' + error.message)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleDeleteOrder = async (orderId) => {
    const confirmed = window.confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')
    if (!confirmed) return

    try {
      setDeletingOrderId(orderId)
      await deleteOrder(orderId)
      setOrders(prev => prev.filter(order => order.id !== orderId))
    } catch (error) {
      alert('Error al eliminar pedido: ' + error.message)
    } finally {
      setDeletingOrderId(null)
    }
  }

  const formatPrice = (cents) => (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
  const formatDate = (dateStr) => new Date(dateStr).toLocaleString('es-ES')

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-white/70 bg-white/80">
        <LoadingSpinner size={6} className="text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-xl shadow-emerald-100">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-600">Pedidos</p>
          <h1 className="text-3xl font-semibold text-gray-900">Gestión de pedidos</h1>
          <p className="text-sm text-gray-500">Visualiza y registra nuevos pedidos.</p>
        </div>
        <button
          onClick={() => setShowManualForm(true)}
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-emerald-100 bg-white/80 px-5 py-2.5 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 opacity-95 transition group-hover:opacity-100" aria-hidden="true" />
          <span className="relative inline-flex items-center gap-2 text-white">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
            </svg>
            Nuevo pedido manual
          </span>
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

      <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-xl shadow-emerald-100">
        <ul role="list" className="divide-y divide-gray-100">
          {orders.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">No hay pedidos registrados.</li>
          ) : (
            orders.map((order) => (
              <li key={order.id} className="px-4 py-5 sm:px-6 transition hover:bg-emerald-50/40">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pedido #{order.id.slice(0, 8)}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'pending' ? 'Pendiente' : 
                         order.status === 'completed' ? 'Completado' : order.status}
                      </span>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCompleteOrder(order.id)}
                          disabled={updatingOrderId === order.id}
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 transition hover:-translate-y-0.5 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Marcar como completado"
                        >
                          {updatingOrderId === order.id ? (
                            'Actualizando…'
                          ) : (
                            <>
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Completar
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Cliente: <span className="font-semibold text-gray-900">{order.users?.full_name || 'Desconocido'}</span> 
                      <span className="mx-2">•</span> 
                      {formatDate(order.created_at)}
                    </p>
                    {order.users?.email && <p className="text-xs text-gray-400">{order.users.email}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-emerald-600">{formatPrice(order.total_cents)}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      disabled={deletingOrderId === order.id}
                      className="inline-flex items-center gap-1 rounded-full border border-red-100 px-3 py-1 text-xs font-semibold text-red-500 transition hover:-translate-y-0.5 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingOrderId === order.id ? 'Eliminando…' : 'Eliminar'}
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 7h12M9 7v10m6-10v10M10 7l1-3h2l1 3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Lista de productos del pedido */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3">
                  <ul className="space-y-2 text-sm text-gray-600">
                    {order.order_items.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>
                          <span className="font-semibold text-gray-900">{item.quantity}x</span> {item.products?.name || 'Producto eliminado'}
                        </span>
                        <span>
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
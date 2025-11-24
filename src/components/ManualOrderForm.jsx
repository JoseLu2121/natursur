// src/components/ManualOrderForm.jsx
import { useState, useEffect } from 'react'
import { getProducts, createOrder } from '../api/products'
import { getUsers } from '../api/users'
import LoadingSpinner from './LoadingSpinner'
import { useAuth } from '../context/AuthContext'

export default function ManualOrderForm({ onOrderCreated, onCancel }) {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [items, setItems] = useState([])

  useEffect(() => {
    async function loadProducts() {
      try {
        const [productsData, usersData] = await Promise.all([
          getProducts(),
          getUsers()
        ])

        setProducts(productsData)
        const clients = usersData.filter(u => u.role === 'client')
        setUsers(clients)

        if (productsData.length > 0) setSelectedProduct(productsData[0].id)
        if (clients.length > 0) setSelectedUserId(clients[0].id)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleAddItem = () => {
    const product = products.find(p => p.id === selectedProduct)
    if (!product) return

    const existingItem = items.find(i => i.product_id === selectedProduct)

    if (existingItem) {
      setItems(prev =>
        prev.map(i =>
          i.product_id === selectedProduct
            ? { ...i, quantity: i.quantity + parseInt(quantity) }
            : i
        )
      )
    } else {
      setItems(prev => [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          unit_price_cents: product.price_cents,
          quantity: parseInt(quantity)
        }
      ])
    }
    setQuantity(1)
  }

  const handleRemoveItem = (productId) => {
    setItems(prev => prev.filter(i => i.product_id !== productId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (items.length === 0) return alert('Añade al menos un producto')
    if (!selectedUserId) return alert('Selecciona un cliente para asignar el pedido')

    try {
      setSubmitting(true)
      await createOrder(selectedUserId, items)
      alert('✅ Pedido manual registrado')
      onOrderCreated()
    } catch (error) {
      alert('Error al crear pedido: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (cents) =>
    (cents / 100).toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR'
    })

  if (loading)
    return (
      <div className="p-4">
        <LoadingSpinner size={6} className="text-primary-600" />
      </div>
    )

  const selectedProductInfo = products.find((p) => p.id === selectedProduct)
  const totalAmount = items.reduce(
    (sum, i) => sum + i.unit_price_cents * i.quantity,
    0
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/5 px-4 py-8 backdrop-blur-sm sm:px-6">
      <div className="w-full max-w-3xl">
        <div className="rounded-[36px] bg-gradient-to-br from-emerald-200 via-white to-lime-200 p-[2px] shadow-[0_25px_90px_rgba(16,185,129,0.28)]">

          {/* MAIN CARD */}
          <div className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-[32px] border border-white/60 bg-white/95 p-6">

            {/* HEADER */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-500">Pedidos</p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">Nuevo pedido manual</h2>
                <p className="text-sm text-gray-500">Arma el pedido seleccionando productos del catálogo y cantidades.</p>
              </div>

              <button
                type="button"
                onClick={onCancel}
                className="rounded-full border border-gray-200 p-2 text-gray-400 transition hover:text-gray-700"
                aria-label="Cerrar"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18 18 6" />
                </svg>
              </button>
            </div>

            {/* CONTENT */}
            <div className="mt-5 space-y-4">

              {/* CLIENT SELECT */}
              <div className="rounded-[24px] border border-gray-100 bg-white/90 p-4 shadow-inner shadow-gray-50">
                <label className="text-sm font-semibold text-gray-700">Cliente</label>
                <div className="mt-2 rounded-2xl border border-gray-200 bg-white px-3 py-2">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
                  >
                    {users.length === 0 ? (
                      <option value="">No hay clientes registrados</option>
                    ) : (
                      users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name || 'Sin nombre'} {u.phone ? `· ${u.phone}` : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* 2-COLUMN SECTION */}
              <div className="grid gap-6 lg:grid-cols-2">

                {/* SELECTED PRODUCT INFO */}
                <div className="rounded-[24px] border border-gray-100 bg-gray-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-500">Producto seleccionado</p>
                  {selectedProductInfo ? (
                    <>
                      <h3 className="mt-2 text-lg font-semibold text-gray-900">{selectedProductInfo.name}</h3>
                      <p className="text-sm text-gray-500">{formatPrice(selectedProductInfo.price_cents)}</p>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">Selecciona un producto para ver su precio.</p>
                  )}
                </div>

                {/* PRODUCT PICKER */}
                <div className="rounded-[24px] border border-gray-100 bg-white/90 p-4 shadow-inner shadow-gray-50">
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700">Producto</label>
                    <div className="mt-2 rounded-2xl border border-gray-200 bg-white px-3 py-2">
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatPrice(p.price_cents)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-gray-700">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-inner shadow-gray-50 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 opacity-95" />
                      <span className="relative inline-flex items-center gap-2 text-white">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
                        </svg>
                        Añadir
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SUMMARY */}
              <div className="mt-6 rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-inner shadow-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Resumen del pedido</h3>
                  <span className="text-sm text-gray-500">{items.length} productos</span>
                </div>

                {items.length === 0 ? (
                  <p className="mt-4 text-sm italic text-gray-500">Todavía no añadiste productos.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {items.map((item) => (
                      <li
                        key={item.product_id}
                        className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/80 px-3 py-2 text-sm text-gray-700"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} uds · {formatPrice(item.unit_price_cents)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">
                            {formatPrice(item.unit_price_cents * item.quantity)}
                          </span>
                          <button
                            onClick={() => handleRemoveItem(item.product_id)}
                            className="rounded-full border border-red-100 px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                          >
                            Quitar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-5 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-lg font-semibold text-gray-900 shadow">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={onCancel}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 sm:flex-none sm:px-6"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || items.length === 0}
                  className="relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full border border-emerald-100 bg-white/80 px-5 py-2.5 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 sm:flex-none sm:px-6"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 opacity-95" />
                  <span className="relative inline-flex items-center gap-2 text-white">
                    {submitting ? 'Guardando...' : 'Confirmar pedido'}
                  </span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

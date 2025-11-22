// src/components/ManualOrderForm.jsx
import { useState, useEffect } from 'react'
import { getProducts, createOrder } from '../api/products'
import LoadingSpinner from './LoadingSpinner'
import { useAuth } from '../context/AuthContext'

export default function ManualOrderForm({ onOrderCreated, onCancel }) {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Estado del carrito "manual"
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [items, setItems] = useState([])

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts()
        setProducts(data)
        if (data.length > 0) setSelectedProduct(data[0].id)
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
      setItems(prev => prev.map(i => 
        i.product_id === selectedProduct 
          ? { ...i, quantity: i.quantity + parseInt(quantity) }
          : i
      ))
    } else {
      setItems(prev => [...prev, {
        product_id: product.id,
        name: product.name,
        unit_price_cents: product.price_cents,
        quantity: parseInt(quantity)
      }])
    }
    setQuantity(1)
  }

  const handleRemoveItem = (productId) => {
    setItems(prev => prev.filter(i => i.product_id !== productId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (items.length === 0) return alert('Añade al menos un producto')

    try {
      setSubmitting(true)
      // Al ser un pedido manual, lo asignamos al usuario actual (Staff)
      // Opcional: Podrías añadir un selector de clientes en el futuro
      await createOrder(user.id, items)
      alert('✅ Pedido manual registrado')
      onOrderCreated()
    } catch (error) {
      alert('Error al crear pedido: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (cents) => (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })

  if (loading) return <div className="p-4"><LoadingSpinner size={6} className="text-primary-600" /></div>

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Nuevo Pedido Manual</h2>
        
        {/* Selección de Productos */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatPrice(p.price_cents)})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Añadir
            </button>
          </div>
        </div>

        {/* Lista de Items */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Resumen del Pedido</h3>
          {items.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No hay productos añadidos aún.</p>
          ) : (
            <ul className="border rounded-md divide-y">
              {items.map(item => (
                <li key={item.product_id} className="p-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-600 ml-2">x {item.quantity}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>{formatPrice(item.unit_price_cents * item.quantity)}</span>
                    <button 
                      onClick={() => handleRemoveItem(item.product_id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 text-right font-bold text-xl">
            Total: {formatPrice(items.reduce((sum, i) => sum + (i.unit_price_cents * i.quantity), 0))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || items.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : 'Confirmar Pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}
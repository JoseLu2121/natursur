// src/components/ManualStockForm.jsx
import { useState, useEffect } from 'react'
import { getProducts, addProductToInventory } from '../api/products'
import LoadingSpinner from './LoadingSpinner'

export default function ManualStockForm({ onStockAdded, onCancel }) {
  const [catalogProducts, setCatalogProducts] = useState([]) // Todos los productos posibles
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(10)

  useEffect(() => {
    async function loadCatalog() {
      try {
        const data = await getProducts() // Carga el catálogo completo
        setCatalogProducts(data)
        if (data.length > 0) setSelectedProductId(data[0].id)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadCatalog()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProductId) return

    try {
      setSubmitting(true)
      await addProductToInventory(selectedProductId, quantity)
      alert('✅ Stock actualizado correctamente')
      onStockAdded()
    } catch (error) {
      alert('Error al actualizar stock: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-6"><LoadingSpinner className="text-primary-600" /></div>

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Entrada de Stock Manual</h2>
        <p className="text-sm text-gray-600 mb-6">Selecciona un producto del catálogo para añadir unidades al inventario.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto del Catálogo</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
            >
              {catalogProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad a añadir</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Añadir al Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
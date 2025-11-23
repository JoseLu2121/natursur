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

  const selectedProduct = catalogProducts.find((p) => p.id === selectedProductId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/5 px-4 py-8 backdrop-blur-sm sm:px-6">
      <div className="w-full max-w-xl">
        <div className="rounded-[34px] bg-gradient-to-br from-emerald-200 via-white to-lime-200 p-[2px] shadow-[0_25px_80px_rgba(16,185,129,0.25)]">
          <div className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-[28px] border border-white/50 bg-white/95 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-500">Inventario</p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">Añadir stock manual</h2>
                <p className="text-sm text-gray-500">Selecciona el producto y la cantidad que quieres sumar al almacén.</p>
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

            {selectedProduct && (
              <div className="mt-5 rounded-2xl border border-emerald-50 bg-emerald-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Producto seleccionado</p>
                <p className="text-base font-semibold text-gray-900">{selectedProduct.name}</p>
                {selectedProduct.category && <p className="text-xs text-gray-500">{selectedProduct.category}</p>}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700">Producto del catálogo</label>
                <div className="mt-2 rounded-2xl border border-gray-200 bg-white/95 px-3 py-2 shadow-inner shadow-gray-50">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
                  >
                    {catalogProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Cantidad a añadir</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 text-sm text-gray-900 shadow-inner shadow-gray-50 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                  <span className="rounded-2xl bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">uds.</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full border border-emerald-100 bg-white/80 px-5 py-2.5 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 opacity-95" aria-hidden="true" />
                  <span className="relative inline-flex items-center gap-2 text-white">
                    {submitting ? (
                      'Guardando...'
                    ) : (
                      <>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
                        </svg>
                        Añadir al stock
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
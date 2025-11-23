import { useState, useEffect } from 'react'
import { getInventory, updateInventoryQuantity, removeFromInventory } from './api/products'
import ManualStockForm from './components/ManualStockForm'
import LoadingSpinner from './components/LoadingSpinner'

export default function Stock() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showManualForm, setShowManualForm] = useState(false)
  
  // Estados para la edición en línea (fila por fila)
  const [editingId, setEditingId] = useState(null)
  const [tempQuantity, setTempQuantity] = useState('')

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getInventory()
      setInventory(data)
    } catch (err) {
      setError(err.message || 'Error al cargar el inventario')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStock = async (inventoryId, newQty) => {
    try {
      await updateInventoryQuantity(inventoryId, newQty)
      
      // Actualizamos el estado local para reflejar el cambio sin recargar
      setInventory(prev => prev.map(item => 
        item.id === inventoryId ? { ...item, quantity: parseInt(newQty) } : item
      ))
      
      setEditingId(null)
      setTempQuantity('')
    } catch (err) {
      alert('Error actualizando stock: ' + err.message)
    }
  }

  const handleDelete = async (inventoryId) => {
    if (!confirm('¿Seguro que quieres quitar este producto del inventario? (El producto seguirá existiendo en el catálogo, pero con stock 0 implícito)')) {
      return
    }

    try {
      await removeFromInventory(inventoryId)
      setInventory(prev => prev.filter(i => i.id !== inventoryId))
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  const handleStockAdded = () => {
    setShowManualForm(false)
    fetchInventory() // Recargamos la lista para mostrar lo nuevo
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-white/70 bg-white/80">
        <LoadingSpinner size={8} className="text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-xl shadow-emerald-100">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-600">Inventario</p>
          <h1 className="text-3xl font-semibold text-gray-900">Control de Stock</h1>
          <p className="text-sm text-gray-500">
            Gestión de productos físicos disponibles en el almacén.
          </p>
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
            Añadir stock manual
          </span>
        </button>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Formulario Manual */}
      {showManualForm && (
        <ManualStockForm
          onStockAdded={handleStockAdded}
          onCancel={() => setShowManualForm(false)}
        />
      )}

      {/* Tabla de Inventario */}
      <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-xl shadow-emerald-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-emerald-50/70">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-700 sm:pl-6">
                Producto
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700">
                Stock Actual
              </th>
              <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white/95">
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-sm text-gray-500">
                  <p className="mb-1 text-base font-semibold text-gray-900">Inventario vacío</p>
                  <p>Usa el botón "+ Añadir Stock Manual" para registrar productos.</p>
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id} className="hover:bg-emerald-50/40">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center gap-3">
                      {item.products?.image_url ? (
                        <img 
                          className="h-12 w-12 flex-shrink-0 rounded-2xl border border-gray-100 object-cover" 
                          src={item.products.image_url} 
                          alt="" 
                        />
                      ) : (
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-dashed border-gray-200 text-[11px] text-gray-400">
                          Sin foto
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">
                          {item.products?.name || <span className="text-red-500 italic">Producto eliminado</span>}
                        </div>
                        <div className="text-xs text-gray-500">ID Inv: {item.id}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={tempQuantity}
                          onChange={(e) => setTempQuantity(e.target.value)}
                          className="w-24 rounded-2xl border border-gray-200 px-3 py-1 text-sm text-gray-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateStock(item.id, tempQuantity)}
                          className="inline-flex items-center justify-center rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                          title="Guardar"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setTempQuantity('')
                          }}
                          className="inline-flex items-center justify-center rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                          title="Cancelar"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.quantity > 10 
                          ? 'bg-green-100 text-green-800' 
                          : item.quantity > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {item.quantity} uds.
                      </span>
                    )}
                  </td>

                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    {editingId !== item.id && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingId(item.id)
                            setTempQuantity(item.quantity)
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/50 px-4 py-1.5 text-xs font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:border-emerald-300"
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/60 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:-translate-y-0.5 hover:border-red-300"
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h12m-1 0-.7 12.6a1 1 0 0 1-1 .94H8.7a1 1 0 0 1-1-.94L7 6m3 0V4.5A1.5 1.5 0 0 1 11.5 3h1A1.5 1.5 0 0 1 14 4.5V6" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="m10 11 4 4m0-4-4 4" />
                          </svg>
                          Quitar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
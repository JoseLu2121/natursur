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
          className="btn-primary flex items-center gap-2 shadow-lg shadow-emerald-200"
        >
          + Añadir Stock Manual
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
                          className="text-emerald-600 transition hover:text-emerald-700"
                          title="Guardar"
                        >
                          ✓
                        </button>
                        <button 
                          onClick={() => setEditingId(null)} 
                          className="text-red-500 transition hover:text-red-600"
                          title="Cancelar"
                        >
                          ✕
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
                      <>
                        <button
                          onClick={() => {
                            setEditingId(item.id)
                            setTempQuantity(item.quantity)
                          }}
                          className="rounded-full border border-emerald-200 px-3 py-1 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="ml-3 rounded-full border border-red-200 px-3 py-1 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Quitar
                        </button>
                      </>
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
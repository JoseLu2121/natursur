import { useState, useEffect } from 'react'
import { getProducts, updateProductStock, deleteProduct } from './api/products'
import ProductForm from './components/ProductForm'
import LoadingSpinner from './components/LoadingSpinner'

export default function Stock() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingStock, setEditingStock] = useState(null)
  const [tempStock, setTempStock] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProducts()
      setProducts(data)
    } catch (err) {
      setError(err.message || 'Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleProductCreated = async (newProduct) => {
    setProducts(prev => [newProduct, ...prev])
    setShowForm(false)
  }

  const handleUpdateStock = async (productId, newStock) => {
    try {
      await updateProductStock(productId, newStock)
      setProducts(prev =>
        prev.map(p =>
          p.id === productId ? { ...p, stock: parseInt(newStock) } : p
        )
      )
      setEditingStock(null)
      setTempStock('')
    } catch (err) {
      setError(err.message || 'Error al actualizar stock')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await deleteProduct(productId)
        setProducts(prev => prev.filter(p => p.id !== productId))
      } catch (err) {
        setError(err.message || 'Error al eliminar producto')
      }
    }
  }

  const formatPrice = (cents) => {
    return (cents / 100).toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size={6} className="text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Stock</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona tus productos y su disponibilidad
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          + Crear Producto
        </button>
      </div>

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

      {showForm && (
        <ProductForm
          onProductCreated={handleProductCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300 border border-primary-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Producto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Descripción
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Precio
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Stock
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {products.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay productos disponibles
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-10 w-10 object-cover rounded"
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {product.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-primary-600">
                      {formatPrice(product.price_cents)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingStock === product.id ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={tempStock}
                          onChange={(e) => setTempStock(e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                        />
                        <button
                          onClick={() => handleUpdateStock(product.id, tempStock)}
                          className="text-green-600 hover:text-green-800 font-semibold text-sm"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingStock(null)}
                          className="text-red-600 hover:text-red-800 font-semibold text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            product.stock > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.stock}
                        </span>
                        <button
                          onClick={() => {
                            setEditingStock(product.id)
                            setTempStock(product.stock)
                          }}
                          className="text-primary-600 hover:text-primary-800 font-semibold text-sm"
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-800 font-semibold text-sm"
                    >
                      Eliminar
                    </button>
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
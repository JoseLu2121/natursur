import { useState } from 'react'
import { createProduct } from '../api/products'
import LoadingSpinner from './LoadingSpinner'
import ImageUploader from './ImageUploader'

export default function ProductForm({ onProductCreated, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_cents: '',
    stock: '',
    image_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price_cents) {
      setError('El nombre y el precio son obligatorios')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Convert price to cents (multiply by 100)
      const priceInCents = Math.round(parseFloat(formData.price_cents) * 100)
      
      const newProduct = await createProduct({
        ...formData,
        price_cents: priceInCents,
      })
      
      setFormData({
        name: '',
        description: '',
        price_cents: '',
        stock: '',
        image_url: '',
      })
      
      onProductCreated(newProduct)
    } catch (err) {
      setError(err.message || 'Error al crear el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Crear Nuevo Producto</h2>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                Nombre del Producto *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Aceite de masaje"
                className="input-primary mt-1"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción del producto"
                rows="3"
                className="input-primary mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price_cents" className="block text-sm font-medium text-gray-900">
                  Precio (€) *
                </label>
                <input
                  type="number"
                  id="price_cents"
                  name="price_cents"
                  value={formData.price_cents}
                  onChange={handleChange}
                  placeholder="29.99"
                  step="0.01"
                  min="0"
                  className="input-primary mt-1"
                  required
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-900">
                  Stock
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="input-primary mt-1"
                />
              </div>
            </div>

            <ImageUploader
              onImageUploaded={(url) => {
                setFormData(prev => ({ ...prev, image_url: url }))
              }}
              currentImage={formData.image_url}
            />

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading && <LoadingSpinner size={4} className="text-white" />}
                {loading ? 'Creando...' : 'Crear Producto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
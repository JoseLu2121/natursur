import { useState } from 'react'
import { createProduct } from '../api/products'
import LoadingSpinner from './LoadingSpinner'
import ImageUploader from './ImageUploader'

export default function ProductForm({ onProductCreated, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_cents: '',
    image_url: ''
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
        price_cents: priceInCents
      })
      
      setFormData({
        name: '',
        description: '',
        price_cents: '',
        image_url: ''
      })
      
      onProductCreated(newProduct)
    } catch (err) {
      setError(err.message || 'Error al crear el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/5 px-4 pb-10 pt-16 backdrop-blur-sm sm:px-6">
      <div className="w-full max-w-md">
        <div className="rounded-[34px] bg-gradient-to-br from-emerald-300 via-white to-lime-200 p-[2px] shadow-[0_25px_90px_rgba(16,185,129,0.28)]">
          <div className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-[30px] border border-white/60 bg-white/95 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-500">Inventario</p>
              <h2 className="text-2xl font-semibold text-gray-900">Crear nuevo producto</h2>
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

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50/80 p-4 mb-4 text-sm text-red-700">
              <div className="flex">
                <svg className="h-5 w-5 mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                <p>{error}</p>
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

            <ImageUploader
              onImageUploaded={(url) => {
                setFormData(prev => ({ ...prev, image_url: url }))
              }}
              currentImage={formData.image_url}
            />

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full border border-emerald-100 bg-white/80 px-5 py-2.5 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 opacity-95" aria-hidden="true" />
                <span className="relative inline-flex items-center gap-2 text-white">
                  {loading && <LoadingSpinner size={4} className="text-white" />}
                  {loading ? 'Creando...' : 'Crear Producto'}
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
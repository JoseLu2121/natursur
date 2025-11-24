import { useState } from 'react'
import LoadingSpinner from './LoadingSpinner'

export default function ClientForm({ onClientCreated, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: ''
  })
  const [creating, setCreating] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.full_name || !formData.phone) {
      alert('Por favor, rellena todos los campos.')
      return
    }

    setCreating(true)
    try {
      await onClientCreated(formData)
      setFormData({ full_name: '', phone: '' })
    } catch (error) {
      console.error('Error creating client:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto backdrop-blur-sm pt-20">
      <div className="relative w-full max-w-2xl rounded-[32px] border border-white/70 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-1 shadow-2xl shadow-emerald-200">
        <div className="max-h-[75vh] overflow-y-auto rounded-[30px] bg-white/95 p-8">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
                Nuevo cliente
              </p>
              <h2 className="text-2xl font-semibold text-gray-900">Añadir cliente manual</h2>
              <p className="mt-1 text-sm text-gray-500">
                Crea un cliente sin que tenga que registrarse por su cuenta.
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700">
                Nombre completo
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Nombre y apellidos"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="+34 612 345 678"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={creating}
                className="group relative flex-1 overflow-hidden rounded-full border border-emerald-100 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400" />
                <span className="relative flex items-center justify-center gap-2 text-white">
                  {creating ? (
                    <>
                      <LoadingSpinner size={4} />
                      Creando…
                    </>
                  ) : (
                    'Crear cliente'
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

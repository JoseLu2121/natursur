import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllAppointmentTypes } from './api/appointmentTypes'

export default function Dashboard({ session, onLogout }) {
  const [appointmentTypes, setAppointmentTypes] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      try {
        const types = await getAllAppointmentTypes()
        setAppointmentTypes(types)
      } catch (error) {
        console.error('Error cargando tipos:', error.message)
      }
    }
    loadData()
  }, [])

  return (
    <div className="relative min-h-screen bg-gray-50 p-6">
      {/* Perfil (botón rápido) */}
      <button
        onClick={() => navigate('/profile')}
        className="absolute top-4 left-4 flex items-center gap-2 bg-white shadow-md hover:bg-gray-100 px-3 py-2 rounded-full transition"
        aria-label="Ir al perfil"
      >
        <span role="img" aria-label="perfil" className="text-lg">
          👤
        </span>
      </button>

      <div className="max-w-5xl mx-auto p-6 md:p-10 bg-white border border-emerald-100 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.15)]">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-sky-900">Bienvenido,</h2>
            <p className="text-slate-600">{session?.user?.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/my-appointments"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-100 shadow-sm text-sm font-medium transition"
            >
              Mis Citas
            </Link>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 bg-gray-100 hover:bg-gray-200 shadow-sm text-slate-700 text-sm font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Tipos de Cita */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-emerald-700">Tipos de Citas</h3>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {appointmentTypes.length > 0 ? (
            appointmentTypes.map((type) => (
              <Link
                key={type.id}
                to={`/appointment-type/${type.id}`}
                className="block border border-emerald-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5"
              >
                <div className="p-5 flex flex-col h-full">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-sky-900 mb-1">{type.name}</h4>
                    {type.description && (
                      <p className="text-sm text-slate-600 line-clamp-3">{type.description}</p>
                    )}
                  </div>
                  <div className="mt-4 text-right">
                    <span className="inline-block text-sm text-emerald-700 font-medium hover:underline">Reservar →</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-slate-500 text-sm col-span-full text-center py-10">No hay tipos de citas disponibles.</p>
          )}
        </div>

        <footer className="mt-10 text-center text-xs text-slate-400">© 2025 Natursur</footer>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllAppointmentTypes } from './api/appointmentTypes'
import { cancelAppointment, getAppointmentsByUser } from './api/appointments'

export default function Dashboard({ session, onLogout }) {
  const [appointmentTypes, setAppointmentTypes] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  // 🔹 Cargar citas del usuario al montar
  useEffect(() => {
    if (!session) return

    const loadUserData = async () => {
      const appts = await getAppointmentsByUser(session.id)
      setAppointments(appts)
      setLoading(false)
    }

    loadUserData()
  }, [session])

  // 🔹 Cargar tipos de cita
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const types = await getAllAppointmentTypes()
        setAppointmentTypes(types)
      } catch (error) {
        console.error('Error cargando tipos:', error.message)
      }
    }

    loadTypes()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-white/60 bg-white/80 text-lg font-semibold text-emerald-700">
        Cargando tu panel...
      </div>
    )
  }

  const handleCancel = async (id) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta cita?')) return

    try {
      await cancelAppointment(id)
      setAppointments(prev =>
        prev.map(a => (a.id === id ? { ...a, status: 'cancelled' } : a))
      )
    } catch (err) {
      alert('Error al cancelar la cita: ' + err.message)
    }
  }

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-emerald-100 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-600">Bienvenido</p>
            <h2 className="text-2xl font-semibold text-gray-900">{session.email}</h2>
            <p className="text-gray-500">Gestiona tus reservas y descubre nuevos rituales.</p>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900">Tipos de Citas</h3>
          {appointmentTypes.length > 0 ? (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {appointmentTypes.map((type) => (
                <li key={type.id}>
                  <Link
                    to={`/appointment-type/${type.id}`}
                    className="block h-full rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5 hover:border-emerald-200"
                  >
                    <h4 className="text-lg font-semibold text-gray-900">{type.name}</h4>
                    {type.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-3">{type.description}</p>
                    )}
                    <span className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-600">
                      Reservar
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/80 p-6 text-center text-sm text-emerald-700">
              No hay tipos de citas disponibles por ahora.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-emerald-100 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-600">Agenda</p>
            <h3 className="text-2xl font-semibold text-gray-900">Mis citas</h3>
          </div>
          <button
            onClick={() => navigate('/my-appointments')}
            className="text-sm font-semibold text-emerald-600 hover:underline"
          >
            Ver todo
          </button>
        </div>

        {appointments.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-6 text-center text-sm text-gray-500">
            No tienes citas registradas por ahora.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {appointments.map((appt) => (
              <li key={appt.id} className="rounded-2xl border border-gray-100 bg-white/90 p-4 shadow">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      {appt.appointment_type?.name || 'Sin tipo'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(appt.start_at).toLocaleString()} · <span className="capitalize">{appt.status}</span>
                    </p>
                  </div>

                  {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/appointments/edit/${appt.id}`)}
                        className="rounded-full border border-amber-200 px-4 py-1.5 text-sm font-semibold text-amber-600 transition hover:bg-amber-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleCancel(appt.id)}
                        className="rounded-full border border-red-200 px-4 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

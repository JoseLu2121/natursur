import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAppointmentsByUser, cancelAppointment } from './api/appointments'

export default function MyAppointments({ session }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true)
        const data = await getAppointmentsByUser(session.user.id)
        setAppointments(data)
      } catch (error) {
        console.error('Error cargando citas:', error.message)
      } finally {
        setLoading(false)
      }
    }
    loadAppointments()
  }, [session.user.id])

  const handleCancel = async (id) => {
    if (!confirm('¿Seguro que quieres cancelar esta cita?')) return
    try {
      setCanceling(id)
      await cancelAppointment(id)
      setAppointments((prev) => prev.filter((a) => a.id !== id))
    } catch (error) {
      alert('Error al cancelar la cita: ' + error.message)
    } finally {
      setCanceling(null)
    }
  }

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
  }

  return (
    <div className="w-full mx-auto p-6 md:p-10 max-w-none p-6 md:p-10 bg-white border border-emerald-100 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.15)] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-100 hover:bg-gray-200 shadow-sm text-slate-700"
        >
          ← Volver
        </button>

        <h1 className="text-2xl md:text-3xl font-semibold text-sky-900 mb-6 pl-10">Mis Citas</h1>
      </div>

      {/* Content */}
      {loading ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="animate-pulse text-emerald-600">Cargando tus citas…</div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p>No tienes citas registradas aún.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-100 text-emerald-800 hover:bg-emerald-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition"
          >
            Reservar una cita
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {appointments.map((appt) => (
            <li
              key={appt.id}
              className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-sky-900">
                    {appt.appointment_type_name}
                  </div>
                  <div className="text-sm text-slate-600">
                    {appt.staff_name && <span>{appt.staff_name}</span>}
                    {appt.tariff_name && (
                      <span className="ml-2 text-slate-500">· {appt.tariff_name}</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {formatDateTime(appt.start_at)} → {formatDateTime(appt.end_at)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/appointment-type/${appt.appointment_type_id}`)}
                    className="px-3 py-1.5 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 transition text-sm font-medium"
                  >
                    Reprogramar
                  </button>

                  <button
                    onClick={() => handleCancel(appt.id)}
                    disabled={canceling === appt.id}
                    className={`px-3 py-1.5 rounded-md border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 transition text-sm font-medium ${
                      canceling === appt.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {canceling === appt.id ? 'Cancelando…' : 'Cancelar'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-10 text-center text-xs text-slate-400">
        © 2025 Natursur
      </footer>
    </div>
  )
}

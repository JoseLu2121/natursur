import { useState, useEffect } from 'react'
import { supabase } from './api/supabaseClient'
import { useAuth } from './context/AuthContext'
import LoadingSpinner from './components/LoadingSpinner'
import ManualAppointmentForm from './components/ManualAppointmentForm'

export default function StaffDashboard({ session }) {
  const { role } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showManualForm, setShowManualForm] = useState(false)
  const staffId = session?.user?.id || session?.id
  const isAdminOrStaff = role === 'admin' || role === 'staff'

  useEffect(() => {
    if (!staffId) return
    fetchStaffAppointments()
  }, [staffId])

  const fetchStaffAppointments = async () => {
    try {
      if (!staffId) return
      setLoading(true)
      setError(null)

      // Get staff appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          appointment_types(name, description),
          users:user_id(full_name, phone)
        `)
        .eq('staff_id', staffId)
        .order('start_at', { ascending: true })

      if (appointmentsError) throw appointmentsError

      // Filter out past appointments older than 24 hours
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

      const filteredAppointments = appointmentsData.filter(
        app => new Date(app.start_at) > twentyFourHoursAgo
      )

      setAppointments(filteredAppointments)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeClass = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'booked':
        return `${baseClasses} bg-primary-100 text-primary-800`
      case 'confirmed':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'completed':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-white/70 bg-white/80">
        <LoadingSpinner size={6} className="text-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/90 p-4 text-red-800">
        <h3 className="font-semibold">Error al cargar las citas</h3>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-emerald-100 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-600">Agenda</p>
            <h1 className="text-2xl font-semibold text-gray-900">Citas asignadas</h1>
            <p className="text-sm text-gray-500">
              Próximos clientes en las próximas 24 horas y futuras.
            </p>
          </div>
          {isAdminOrStaff && (
            <button
              onClick={() => setShowManualForm(true)}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-emerald-100 bg-white/80 px-5 py-2.5 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 opacity-95" aria-hidden="true" />
              <span className="relative inline-flex items-center gap-2 text-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
                </svg>
                Nueva cita manual
              </span>
            </button>
          )}
        </div>
      </div>

      {showManualForm && (
        <ManualAppointmentForm
          onAppointmentCreated={() => {
            setShowManualForm(false)
            fetchStaffAppointments()
          }}
          onCancel={() => setShowManualForm(false)}
        />
      )}

      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-emerald-100 backdrop-blur">

      <div className="overflow-hidden rounded-2xl border border-white/60 shadow-lg shadow-emerald-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-emerald-50/60 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                <th className="px-4 py-3 text-left font-semibold">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold">Fecha y hora</th>
                <th className="px-4 py-3 text-left font-semibold">Estado</th>
                <th className="px-4 py-3 text-left font-semibold">Teléfono</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No hay citas programadas.
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-emerald-50/40">
                    <td className="px-4 py-4 font-semibold text-gray-900">
                      {appointment.users?.full_name || 'Cliente sin nombre'}
                    </td>
                    <td className="px-4 py-4 text-gray-600">{appointment.appointment_types?.name}</td>
                    <td className="px-4 py-4 text-gray-600">{formatDate(appointment.start_at)}</td>
                    <td className="px-4 py-4 text-gray-600">
                      <span className={getStatusBadgeClass(appointment.status)}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {appointment.users?.phone || 'No disponible'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  )
}
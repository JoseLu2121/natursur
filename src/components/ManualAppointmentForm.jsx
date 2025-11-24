import { useState, useEffect } from 'react'
import { getUsers } from '../api/users'
import { getAllAppointmentTypes } from '../api/appointmentTypes'
import { supabase } from '../api/supabaseClient'
import LoadingSpinner from './LoadingSpinner'

export default function ManualAppointmentForm({ onAppointmentCreated, onCancel }) {
  const [users, setUsers] = useState([])
  const [appointmentTypes, setAppointmentTypes] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    user_id: '',
    appointment_type_id: '',
    staff_id: '',
    start_at: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [usersData, typesData] = await Promise.all([
        getUsers(),
        getAllAppointmentTypes()
      ])

      const clients = usersData.filter(u => u.role === 'client')
      const staffList = usersData.filter(u => u.role === 'staff' || u.role === 'admin')

      setUsers(clients)
      setStaff(staffList)
      setAppointmentTypes(typesData)

      if (clients.length > 0) setFormData(prev => ({ ...prev, user_id: clients[0].id }))
      if (typesData.length > 0) setFormData(prev => ({ ...prev, appointment_type_id: typesData[0].id }))
      if (staffList.length > 0) setFormData(prev => ({ ...prev, staff_id: staffList[0].id }))
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.user_id || !formData.appointment_type_id || !formData.staff_id || !formData.start_at) {
      alert('Por favor, completa todos los campos obligatorios.')
      return
    }

    try {
      setSubmitting(true)

      // Calculate end time (default 60 minutes)
      const startDate = new Date(formData.start_at)
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          user_id: formData.user_id,
          appointment_type_id: formData.appointment_type_id,
          staff_id: formData.staff_id,
          start_at: formData.start_at,
          end_at: endDate.toISOString(),
          status: 'confirmed',
          notes: formData.notes || null
        })
        .select()
        .single()

      if (error) throw error

      alert('✅ Cita creada exitosamente')
      onAppointmentCreated(data)
    } catch (error) {
      alert('Error al crear cita: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="rounded-3xl border border-white/70 bg-white/95 p-6">
          <LoadingSpinner size={6} />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto backdrop-blur-sm pt-20">
      <div className="relative w-full max-w-2xl rounded-[32px] border border-white/70 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-1 shadow-2xl shadow-emerald-200">
        <div className="max-h-[75vh] overflow-y-auto rounded-[30px] bg-white/95 p-8">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
                Nueva cita
              </p>
              <h2 className="text-2xl font-semibold text-gray-900">Crear cita manual</h2>
              <p className="mt-1 text-sm text-gray-500">
                Asigna una cita a un cliente manualmente.
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
              <label htmlFor="user_id" className="block text-sm font-semibold text-gray-700">
                Cliente *
              </label>
              <select
                id="user_id"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || 'Sin nombre'} {user.phone ? `· ${user.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="appointment_type_id" className="block text-sm font-semibold text-gray-700">
                Tipo de cita *
              </label>
              <select
                id="appointment_type_id"
                name="appointment_type_id"
                value={formData.appointment_type_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                {appointmentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="staff_id" className="block text-sm font-semibold text-gray-700">
                Profesional *
              </label>
              <select
                id="staff_id"
                name="staff_id"
                value={formData.staff_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                {staff.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || 'Sin nombre'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="start_at" className="block text-sm font-semibold text-gray-700">
                Fecha y hora *
              </label>
              <input
                type="datetime-local"
                id="start_at"
                name="start_at"
                value={formData.start_at}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700">
                Notas (opcional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Información adicional sobre la cita"
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
                disabled={submitting}
                className="group relative flex-1 overflow-hidden rounded-full border border-emerald-100 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400" />
                <span className="relative flex items-center justify-center gap-2 text-white">
                  {submitting ? (
                    <>
                      <LoadingSpinner size={4} />
                      Creando…
                    </>
                  ) : (
                    'Crear cita'
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

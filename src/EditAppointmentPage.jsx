// src/pages/EditAppointmentPage.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from './api/supabaseClient'
import { calculateAvailableSlots } from './api/weeklySlots'
import {
  getAppointmentTypeById,
  getTariffsByAppointmentType,
  getAvailableStaffForType
} from './api/appointmentTypes'
import { updateAppointment, loadAppointment } from './api/appointments'

export default function EditAppointmentPage() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()

  const [appointment, setAppointment] = useState(null)
  const [appointmentType, setAppointmentType] = useState(null)
  const [staffMembers, setStaffMembers] = useState([])
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [selectedTariff, setSelectedTariff] = useState(null)
  const [date, setDate] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [confirming, setConfirming] = useState(false)

  // 🔹 Cargar cita existente
  useEffect(() => {
  const fetchAppointment = async () => {
    try {
      const data = await loadAppointment(appointmentId)
      setAppointment(data)
      setDate(data.start_at.split('T')[0])
      setSelectedStaff({ id: data.staff_id })
    } catch (error) {
      console.error('Error cargando cita:', error.message)
    }
  }
  fetchAppointment()
}, [appointmentId])

  // 🔹 Cargar datos de tipo, staff y tarifa
  useEffect(() => {
    const loadData = async () => {
      if (!appointment) return
      try {
        setLoading(true)

        const type = await getAppointmentTypeById(appointment.appointment_type_id)
        setAppointmentType(type)

        const staff = await getAvailableStaffForType(appointment.appointment_type_id)
        setStaffMembers(staff)

        // Cargamos la tarifa asociada a este tipo
        const tariffList = await getTariffsByAppointmentType(appointment.appointment_type_id)
        if (tariffList?.length > 0) {
          // Tomamos la primera (o la que corresponda)
          setSelectedTariff(tariffList[0])
        }
      } catch (error) {
        console.error('Error cargando datos:', error.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [appointment])

  // 🔹 Buscar slots disponibles
  const fetchSlots = async () => {
    if (!appointmentType || !selectedStaff || !selectedTariff || !date) {
      return alert('Faltan datos para buscar horarios disponibles.')
    }

    try {
      setLoadingSlots(true)
      const slots = await calculateAvailableSlots(
        appointmentType.id,
        date,
        selectedTariff.duration_minutes,
        selectedStaff.id
      )
      setAvailableSlots(slots)
      setSelectedSlot(null)
    } catch (error) {
      console.error('Error slots:', error.message)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  // 🔹 Confirmar actualización
  const handleConfirmEdit = async () => {
    if (!selectedSlot) return alert('Selecciona un horario disponible.')
    try {
      setConfirming(true)
      await updateAppointment(appointmentId, {
        staff_id: selectedStaff.id,
        start_at: selectedSlot.start_at,
        end_at: selectedSlot.end_at,
        status: 'confirmed'
      })
      alert('✅ Cita actualizada correctamente')
      navigate('/profile')
    } catch (error) {
      alert('Error al actualizar cita: ' + error.message)
    } finally {
      setConfirming(false)
    }
  }

  const formatTimeRange = (slot) =>
    `${new Date(slot.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
     ${new Date(slot.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

  if (loading || !appointmentType)
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-3xl border border-white/70 bg-white/90 px-6 py-4 shadow-xl shadow-emerald-100">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-semibold text-emerald-700">Cargando…</p>
        </div>
      </div>
    )

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/70 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-8 shadow-2xl shadow-emerald-100">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">
            Editar cita
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">{appointmentType.name}</h1>
          <p className="text-sm text-gray-500">Modifica los detalles de tu reserva.</p>
        </div>
      </div>

      {/* Staff */}
      <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-xl shadow-emerald-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecciona un profesional</h2>
        <div className="space-y-3">
          {staffMembers.map((s) => (
            <label
              key={s.id}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
                selectedStaff?.id === s.id
                  ? 'border-emerald-200 bg-emerald-50/80 shadow-md shadow-emerald-100'
                  : 'border-gray-200 bg-white hover:border-emerald-100 hover:bg-emerald-50/30'
              }`}
            >
              <span className="font-semibold text-gray-900">{s.full_name}</span>
              <input
                type="radio"
                checked={selectedStaff?.id === s.id}
                onChange={() => setSelectedStaff(s)}
                className="h-5 w-5 text-emerald-600 focus:ring-2 focus:ring-emerald-200"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Tarifa bloqueada */}
      {selectedTariff && (
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-xl shadow-emerald-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tarifa actual</h2>
          <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div>
              <div className="font-semibold text-gray-900">{selectedTariff.name}</div>
              <div className="text-sm text-gray-500">
                {selectedTariff.duration_minutes} minutos
              </div>
            </div>
            <div className="text-right text-xl font-semibold text-emerald-600">
              {selectedTariff.price_cents
                ? `${(selectedTariff.price_cents / 100).toFixed(2)}€`
                : 'Gratis'}
            </div>
          </div>
        </div>
      )}

      {/* Fecha */}
      <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-xl shadow-emerald-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecciona fecha y horario</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <button
            onClick={fetchSlots}
            disabled={loadingSlots}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-emerald-100 bg-white/80 px-5 py-2.5 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 opacity-95" aria-hidden="true" />
            <span className="relative text-white">
              {loadingSlots ? 'Buscando…' : 'Ver horarios'}
            </span>
          </button>
        </div>

        {/* Slots */}
        <div className="mt-6 space-y-3">
          {availableSlots.length > 0 ? (
            availableSlots.map((slot) => (
              <div
                key={slot.start_at}
                onClick={() => !slot.is_booked && setSelectedSlot(slot)}
                className={`flex items-center justify-between rounded-2xl border p-4 transition ${
                  slot.is_booked
                    ? 'cursor-not-allowed border-red-100 bg-red-50/50 opacity-60'
                    : selectedSlot?.start_at === slot.start_at
                    ? 'cursor-pointer border-emerald-200 bg-emerald-50/80 shadow-md shadow-emerald-100 ring-2 ring-emerald-200'
                    : 'cursor-pointer border-gray-200 bg-white hover:-translate-y-0.5 hover:border-emerald-100 hover:bg-emerald-50/30'
                }`}
              >
                <span className="font-semibold text-gray-900">{formatTimeRange(slot)}</span>
                {slot.is_booked ? (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">Ocupado</span>
                ) : selectedSlot?.start_at === slot.start_at ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">✓ Seleccionado</span>
                ) : (
                  <span className="text-sm text-gray-500">Disponible</span>
                )}
              </div>
            ))
          ) : (
            date && (
              <p className="py-8 text-center text-sm text-gray-500">
                No hay horarios disponibles para esta fecha.
              </p>
            )
          )}
        </div>
      </div>

      {selectedSlot && (
        <div className="flex justify-end">
          <button
            onClick={handleConfirmEdit}
            disabled={confirming}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-emerald-100 px-6 py-3 text-sm font-semibold shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400" />
            <span className="relative text-white">
              {confirming ? 'Actualizando…' : 'Guardar cambios'}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

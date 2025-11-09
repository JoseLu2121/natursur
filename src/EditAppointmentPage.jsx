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
      <div className="min-h-[240px] flex items-center justify-center">
        <div className="animate-pulse text-emerald-600">Cargando...</div>
      </div>
    )

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-100 hover:bg-gray-200 shadow-sm text-slate-700 mb-6"
      >
        ← Volver
      </button>

      <h1 className="text-2xl font-semibold text-sky-900 mb-4">
        Editar cita: {appointmentType.name}
      </h1>

      {/* Staff */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-emerald-700 mb-2">Selecciona un masajista</h2>
        <div className="space-y-2">
          {staffMembers.map((s) => (
            <label
              key={s.id}
              className={`flex justify-between p-3 rounded-lg border cursor-pointer ${
                selectedStaff?.id === s.id
                  ? 'bg-emerald-50 ring-2 ring-emerald-200'
                  : 'hover:bg-emerald-50'
              }`}
            >
              <span>{s.full_name}</span>
              <input
                type="radio"
                checked={selectedStaff?.id === s.id}
                onChange={() => setSelectedStaff(s)}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Tarifa bloqueada */}
      {selectedTariff && (
        <div className="mb-6">
          <h2 className="text-lg font-medium text-sky-700 mb-2">Tarifa actual</h2>
          <div className="p-3 rounded-lg border bg-sky-50 flex justify-between">
            <div>
              <div className="font-medium text-slate-800">{selectedTariff.name}</div>
              <div className="text-xs text-slate-500">
                {selectedTariff.duration_minutes} min
              </div>
            </div>
            <div className="text-right font-medium text-slate-800">
              {selectedTariff.price_cents
                ? `${(selectedTariff.price_cents / 100).toFixed(2)}€`
                : 'Gratis'}
            </div>
          </div>
        </div>
      )}

      {/* Fecha */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 border rounded px-3 py-2"
          />
        </div>
        <button
          onClick={fetchSlots}
          disabled={loadingSlots}
          className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 border text-slate-700"
        >
          {loadingSlots ? 'Buscando...' : 'Ver horarios'}
        </button>
      </div>

      {/* Slots */}
      <div className="space-y-2">
        {availableSlots.length > 0 ? (
          availableSlots.map((slot) => (
            <div
              key={slot.start_at}
              onClick={() => !slot.is_booked && setSelectedSlot(slot)}
              className={`p-3 rounded-lg border transition cursor-pointer ${
                slot.is_booked
                  ? 'bg-red-50 border-red-200 opacity-60 cursor-not-allowed'
                  : selectedSlot?.start_at === slot.start_at
                  ? 'bg-emerald-100 border-emerald-300 ring-2 ring-emerald-200'
                  : 'hover:bg-sky-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{formatTimeRange(slot)}</span>
                {slot.is_booked ? (
                  <span className="text-xs text-red-500 font-medium">Ocupado</span>
                ) : selectedSlot?.start_at === slot.start_at ? (
                  <span className="text-xs text-emerald-600 font-medium">Seleccionado</span>
                ) : (
                  <span className="text-xs text-slate-500">Disponible</span>
                )}
              </div>
            </div>
          ))
        ) : (
          date && (
            <p className="text-sm text-slate-500 mt-4">
              No hay horarios disponibles.
            </p>
          )
        )}
      </div>

      {selectedSlot && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleConfirmEdit}
            disabled={confirming}
            className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300"
          >
            {confirming ? 'Actualizando...' : 'Guardar cambios'}
          </button>
        </div>
      )}
    </div>
  )
}

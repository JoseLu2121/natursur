// src/pages/AppointmentTypeDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { calculateAvailableSlots } from './api/weeklySlots'
import {
  getAppointmentTypeById,
  getTariffsByAppointmentType,
  getAvailableStaffForType,
} from './api/appointmentTypes'
import { createMultipleAppointments } from './api/appointments'
import { supabase } from './api/supabaseClient'

export default function AppointmentTypeDetail() {
  const { typeId } = useParams()
  const navigate = useNavigate()
  const [appointmentType, setAppointmentType] = useState(null)
  const [staffMembers, setStaffMembers] = useState([])
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [tariffs, setTariffs] = useState([])
  const [selectedTariff, setSelectedTariff] = useState(null)
  const [date, setDate] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlots, setSelectedSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const type = await getAppointmentTypeById(typeId)
        setAppointmentType(type)
        const staff = await getAvailableStaffForType(typeId)
        setStaffMembers(staff)
      } catch (error) {
        console.error('Error cargando datos:', error.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [typeId])

  useEffect(() => {
    const loadTariffs = async () => {
      if (selectedStaff) {
        try {
          const tariffList = await getTariffsByAppointmentType(typeId)
          setTariffs(tariffList)
        } catch (error) {
          console.error('Error cargando tarifas:', error.message)
        }
      }
    }
    loadTariffs()
  }, [selectedStaff, typeId])

  const fetchSlots = async () => {
    if (!selectedTariff || !selectedStaff) {
      alert('Selecciona primero un masajista y una tarifa')
      return
    }
    try {
      setLoadingSlots(true)
      const slots = await calculateAvailableSlots(
        typeId,
        date,
        selectedTariff.duration_minutes,
        selectedStaff.id
      )
      setAvailableSlots(slots)
      setSelectedSlots([])
    } catch (error) {
      console.error('Error cargando slots:', error.message)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleSelectSlot = (slot) => {
    if (slot.is_booked) return
    const isSelected = selectedSlots.some((s) => s.start_at === slot.start_at)
    const sessionsAllowed = selectedTariff.sessions || 1

    if (!isSelected) {
      if (selectedSlots.length >= sessionsAllowed) {
        alert(`Solo puedes seleccionar ${sessionsAllowed} sesión(es) con esta tarifa.`)
        return
      }
      setSelectedSlots([...selectedSlots, slot])
    } else {
      setSelectedSlots(selectedSlots.filter((s) => s.start_at !== slot.start_at))
    }
  }

  const handleConfirmReservations = async () => {
    if (selectedSlots.length === 0) return
    try {
      setConfirming(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const appointmentsToCreate = selectedSlots.map((slot) => ({
        appointment_type_id: typeId,
        staffId: selectedStaff.id,
        start_at: slot.start_at,
        end_at: slot.end_at,
        userId: user?.id,
      }))

      await createMultipleAppointments(appointmentsToCreate)
      alert('¡Citas reservadas con éxito!')
      setSelectedSlots([])
      fetchSlots()
    } catch (error) {
      alert('Error al confirmar: ' + error.message)
    } finally {
      setConfirming(false)
    }
  }

  const formatTimeRange = (slot) => {
    return `${new Date(slot.start_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })} - ${new Date(slot.end_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }

  if (loading)
    return (
      <div className="min-h-[240px] flex items-center justify-center">
        <div className="animate-pulse text-emerald-600">Cargando...</div>
      </div>
    )

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 bg-white border border-emerald-100 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.15)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-100 hover:bg-gray-200 shadow-sm text-slate-700"
          aria-label="Volver"
        >
          <span className="text-lg">←</span>
          <span className="text-sm">Volver</span>
        </button>

        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-sky-900">
            {appointmentType.name}
          </h1>
          {appointmentType.description && (
            <p className="mt-1 text-sm text-slate-600">{appointmentType.description}</p>
          )}
        </div>
      </div>

      {/* Selección de masajista y tarifa */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Masajista */}
        <section className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-medium text-emerald-700 mb-3">
            Selecciona un masajista
          </h2>

          {staffMembers.length > 0 ? (
            <div className="space-y-3">
              {staffMembers.map((staff) => (
                <label
                  key={staff.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer transition-shadow outline-none ${
                    selectedStaff?.id === staff.id
                      ? 'ring-2 ring-emerald-200 shadow-md bg-emerald-50'
                      : 'hover:shadow hover:bg-emerald-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                      {staff.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{staff.full_name}</div>
                      {staff.role && (
                        <div className="text-xs text-slate-500">{staff.role}</div>
                      )}
                    </div>
                  </div>

                  <input
                    className="sr-only"
                    type="radio"
                    name="staff"
                    value={staff.id}
                    checked={selectedStaff?.id === staff.id}
                    onChange={() => {
                      setSelectedStaff(staff)
                      setSelectedTariff(null)
                      setDate('')
                      setAvailableSlots([])
                      setSelectedSlots([])
                    }}
                  />
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No hay masajistas disponibles para este tipo de cita.
            </p>
          )}
        </section>

        {/* Tarifa */}
        <section className="bg-white border border-sky-50 rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-medium text-sky-700 mb-3">Selecciona una tarifa</h2>

          {!selectedStaff ? (
            <p className="text-sm text-slate-500">Selecciona primero un masajista</p>
          ) : tariffs.length === 0 ? (
            <p className="text-sm text-slate-500">Cargando tarifas…</p>
          ) : (
            <div className="space-y-3">
              {tariffs.map((t) => (
                <label
                  key={t.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer transition-shadow ${
                    selectedTariff?.id === t.id
                      ? 'ring-2 ring-sky-100 shadow-md bg-sky-50'
                      : 'hover:shadow hover:bg-sky-50'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-800">{t.name}</div>
                    <div className="text-xs text-slate-500">
                      {t.sessions ? `${t.sessions} sesiones · ` : ''}
                      {t.duration_minutes} min
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-medium text-slate-800">
                      {t.price_cents ? `${(t.price_cents / 100).toFixed(2)}€` : 'Gratis'}
                    </div>
                    <input
                      className="sr-only"
                      type="radio"
                      name="tariff"
                      value={t.id}
                      checked={selectedTariff?.id === t.id}
                      onChange={() => {
                        setSelectedTariff(t)
                        setDate('')
                        setAvailableSlots([])
                        setSelectedSlots([])
                      }}
                    />
                  </div>
                </label>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Fecha y slots */}
      {selectedTariff && (
        <div className="mt-6 bg-white border border-emerald-50 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end md:gap-4 gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700">
                Selecciona una fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 w-full md:w-64 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchSlots}
                disabled={!date || loadingSlots}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium shadow-sm transition ${
                  !date || loadingSlots
                    ? 'bg-gray-200 text-slate-500 cursor-not-allowed'
                    : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                }`}
              >
                {loadingSlots ? 'Buscando…' : 'Ver horarios disponibles'}
              </button>

              <button
                onClick={() => {
                  setDate('')
                  setAvailableSlots([])
                  setSelectedSlots([])
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 bg-gray-100 text-slate-700 hover:bg-gray-200"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Slots */}
          <div className="mt-4">
            {availableSlots.length > 0 ? (
              <>
                <div className="text-sm text-slate-600 mb-3">
                  Seleccionadas: {selectedSlots.length} /{' '}
                  {selectedTariff.sessions || 1}
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlots.some(
                      (s) => s.start_at === slot.start_at
                    )
                    return (
                      <li
                        key={`${slot.slot_id}-${slot.start_at}`}
                        className={`flex items-center justify-between p-3 rounded-lg border transition ${
                          slot.is_booked
                            ? 'bg-red-50 border-red-200 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-100 border-emerald-300 ring-2 ring-emerald-200'
                            : 'bg-gradient-to-r from-white to-sky-50 border-sky-100 hover:bg-sky-100 cursor-pointer'
                        }`}
                        onClick={() => handleSelectSlot(slot)}
                      >
                        <div>
                          <div className="font-medium text-slate-800">
                            {formatTimeRange(slot)}
                          </div>
                          {slot.is_booked ? (
                            <div className="text-xs text-red-500 font-medium">
                              Ocupado
                            </div>
                          ) : (
                            isSelected && (
                              <div className="text-xs text-emerald-600 font-medium">
                                Seleccionado
                              </div>
                            )
                          )}
                        </div>
                        <div className="text-sm text-slate-600">
                          {slot.is_booked ? '—' : isSelected ? '✓' : '+'}
                        </div>
                      </li>
                    )
                  })}
                </ul>

                {selectedSlots.length > 0 && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleConfirmReservations}
                      disabled={confirming}
                      className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow transition disabled:bg-gray-300"
                    >
                      {confirming
                        ? 'Confirmando...'
                        : `Confirmar ${selectedSlots.length} reserva${
                            selectedSlots.length > 1 ? 's' : ''
                          }`}
                    </button>
                  </div>
                )}
              </>
            ) : (
              date && (
                <p className="text-sm text-slate-500 mt-4">
                  No hay horarios disponibles.
                </p>
              )
            )}
          </div>
        </div>
      )}

      <footer className="mt-6 text-center text-xs text-slate-400">
        <div>© 2025 Natursur</div>
      </footer>
    </div>
  )
}

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
  const [selectedSlotsByDate, setSelectedSlotsByDate] = useState({})
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
    } catch (error) {
      console.error('Error cargando slots:', error.message)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleSelectSlot = (slot) => {
    if (slot.is_booked) return
    if (!date) return alert('Selecciona una fecha antes de elegir hora')

    const sessionsAllowed = selectedTariff.sessions || 1
    const currentDaySlots = selectedSlotsByDate[date] || []
    const isSelected = currentDaySlots.some((s) => s.start_at === slot.start_at)

    const totalSelected = Object.values(selectedSlotsByDate).flat().length

    if (!isSelected) {
      if (totalSelected >= sessionsAllowed) {
        alert(`Solo puedes seleccionar ${sessionsAllowed} sesión(es) con esta tarifa.`)
        return
      }
      const updated = {
        ...selectedSlotsByDate,
        [date]: [...currentDaySlots, slot]
      }
      setSelectedSlotsByDate(updated)
    } else {
      const updated = {
        ...selectedSlotsByDate,
        [date]: currentDaySlots.filter((s) => s.start_at !== slot.start_at)
      }
      setSelectedSlotsByDate(updated)
    }
  }

  const handleConfirmReservations = async () => {
    const allSelectedSlots = Object.values(selectedSlotsByDate).flat()
    if (allSelectedSlots.length === 0) return

    try {
      setConfirming(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const appointmentsToCreate = allSelectedSlots.map((slot) => ({
        appointment_type_id: typeId,
        staffId: selectedStaff.id,
        start_at: slot.start_at,
        end_at: slot.end_at,
        userId: user?.id,
      }))

      await createMultipleAppointments(appointmentsToCreate)
      alert('¡Citas reservadas con éxito!')
      setSelectedSlotsByDate({})
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

  const totalSelectedCount = Object.values(selectedSlotsByDate).flat().length

  if (loading)
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-white/60 bg-white/80 text-emerald-700">
        <div className="animate-pulse">Cargando...</div>
      </div>
    )

  return (
    <div className="mx-auto max-w-4xl space-y-6 rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-2xl shadow-emerald-100 backdrop-blur">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:-translate-y-0.5 hover:bg-gray-50"
          aria-label="Volver"
        >
          <span className="text-lg">←</span>
          <span>Volver</span>
        </button>

        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-gray-900">
            {appointmentType.name}
          </h1>
          {appointmentType.description && (
            <p className="mt-2 text-sm text-gray-500">{appointmentType.description}</p>
          )}
        </div>
      </div>

      {/* Selección de masajista y tarifa */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Masajista */}
        <section className="rounded-2xl border border-emerald-100/80 bg-white/90 p-5 shadow-lg shadow-emerald-50">
          <h2 className="mb-3 text-lg font-semibold text-emerald-700">
            Selecciona un masajista
          </h2>

          {staffMembers.length > 0 ? (
            <div className="space-y-3">
              {staffMembers.map((staff) => (
                <label
                  key={staff.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition ${
                    selectedStaff?.id === staff.id
                      ? 'border-emerald-200 bg-emerald-50 shadow-lg shadow-emerald-100'
                      : 'border-transparent bg-white/70 hover:border-emerald-100 hover:bg-emerald-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
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
                      setSelectedSlotsByDate({})
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
        <section className="rounded-2xl border border-emerald-100/80 bg-white/90 p-5 shadow-lg shadow-emerald-50">
          <h2 className="mb-3 text-lg font-semibold text-emerald-700">Selecciona una tarifa</h2>

          {!selectedStaff ? (
            <p className="text-sm text-gray-500">Selecciona primero un masajista</p>
          ) : tariffs.length === 0 ? (
            <p className="text-sm text-gray-500">Cargando tarifas…</p>
          ) : (
            <div className="space-y-3">
              {tariffs.map((t) => (
                <label
                  key={t.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition ${
                    selectedTariff?.id === t.id
                      ? 'border-emerald-200 bg-emerald-50 shadow-lg shadow-emerald-100'
                      : 'border-transparent bg-white/70 hover:border-emerald-100 hover:bg-emerald-50/60'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500">
                      {t.sessions ? `${t.sessions} sesiones · ` : ''}
                      {t.duration_minutes} min
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
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
                        setSelectedSlotsByDate({})
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
        <div className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-lg shadow-emerald-100">
          <div className="flex flex-col md:flex-row md:items-end md:gap-4 gap-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-600">
                Selecciona una fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-gray-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchSlots}
                disabled={!date || loadingSlots}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  !date || loadingSlots
                    ? 'bg-gray-200 text-gray-500'
                    : 'border border-emerald-200 bg-white/80 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                {loadingSlots ? 'Buscando…' : 'Ver horarios disponibles'}
              </button>

              <button
                onClick={() => {
                  setDate('')
                  setAvailableSlots([])
                }}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Slots */}
          <div className="mt-4">
            {availableSlots.length > 0 ? (
              <>
                <div className="mb-3 text-sm text-gray-500">
                  Seleccionadas: {totalSelectedCount} / {selectedTariff.sessions || 1}
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableSlots.map((slot) => {
                    const isSelected =
                      selectedSlotsByDate[date]?.some(
                        (s) => s.start_at === slot.start_at
                      ) || false
                    return (
                      <li
                        key={`${slot.slot_id}-${slot.start_at}`}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
                          slot.is_booked
                            ? 'cursor-not-allowed border-red-100 bg-red-50/70 text-red-500'
                            : isSelected
                            ? 'border-emerald-200 bg-emerald-50 shadow-inner shadow-emerald-100'
                            : 'cursor-pointer border-gray-100 bg-white/70 hover:border-emerald-100'
                        }`}
                        onClick={() => handleSelectSlot(slot)}
                      >
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatTimeRange(slot)}
                          </div>
                          {slot.is_booked ? (
                            <div className="text-xs font-semibold uppercase tracking-wide text-red-500">
                              Ocupado
                            </div>
                          ) : (
                            isSelected && (
                              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                                Seleccionado
                              </div>
                            )
                          )}
                        </div>
                        <div className="text-sm font-semibold text-gray-500">
                          {slot.is_booked ? '—' : isSelected ? '✓' : '+'}
                        </div>
                      </li>
                    )
                  })}
                </ul>

                {totalSelectedCount > 0 && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleConfirmReservations}
                      disabled={confirming}
                      className="rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-6 py-2 font-semibold text-white shadow-lg shadow-emerald-200 transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {confirming
                        ? 'Confirmando...'
                        : `Confirmar ${totalSelectedCount} reserva${
                            totalSelectedCount > 1 ? 's' : ''
                          }`}
                    </button>
                  </div>
                )}
              </>
            ) : (
              date && (
                <p className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-500">
                  No hay horarios disponibles.
                </p>
              )
            )}
          </div>
        </div>
      )}

      <footer className="pt-2 text-center text-xs text-gray-400">© 2025 Natursur</footer>
    </div>
  )
}

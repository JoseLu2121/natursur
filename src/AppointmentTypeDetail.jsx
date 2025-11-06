import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { calculateAvailableSlots } from './api/weeklySlots'
import { getAppointmentTypeById, getTariffsByAppointmentType, getAvailableStaffForType } from './api/appointmentTypes'
import { createAppointment } from './api/appointments'

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
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loading, setLoading] = useState(true)

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
      const slots = await calculateAvailableSlots(typeId, date, selectedTariff.duration_minutes, selectedStaff.id)
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error cargando slots:', error.message)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleReserve = async (slot) => {
    try {
      await createAppointment({
        appointment_type_id: typeId,
        tariff_id: selectedTariff.id,
        staff_id: selectedStaff.id,
        start_at: slot.start_at,
        end_at: slot.end_at
      })
      alert('¡Cita reservada con éxito!')
      fetchSlots()
    } catch (error) {
      alert('Error al reservar: ' + error.message)
    }
  }

  const formatTimeRange = (slot) => {
    return `${new Date(slot.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(slot.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  if (loading) return (
    <div className="min-h-[240px] flex items-center justify-center">
      <div className="animate-pulse text-emerald-600">Cargando...</div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-soft inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-100 hover:bg-gray-200 shadow-sm text-slate-700"
          aria-label="Volver"
        >
          <span className="text-lg">←</span>
          <span className="text-sm">Volver</span>
        </button>

        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-sky-900">{appointmentType.name}</h1>
          {appointmentType.description && (
            <p className="mt-1 text-sm text-slate-600">{appointmentType.description}</p>
          )}
        </div>

        
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-medium text-emerald-700 mb-3">Selecciona un masajista</h2>

          {staffMembers.length > 0 ? (
            <div className="space-y-3">
              {staffMembers.map(staff => (
                <label
                  key={staff.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer transition-shadow outline-none
                    ${selectedStaff?.id === staff.id ? 'ring-2 ring-emerald-200 shadow-md bg-emerald-50' : 'hover:shadow hover:bg-emerald-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                      {staff.full_name.split(' ').map(n => n[0]).slice(0,2).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{staff.full_name}</div>
                      {staff.role && <div className="text-xs text-slate-500">{staff.role}</div>}
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
                    }}
                    aria-checked={selectedStaff?.id === staff.id}
                  />
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No hay masajistas disponibles para este tipo de cita.</p>
          )}
        </section>

        <section className="bg-white border border-sky-50 rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-medium text-sky-700 mb-3">Selecciona una tarifa</h2>

          {!selectedStaff ? (
            <p className="text-sm text-slate-500">Selecciona primero un masajista</p>
          ) : tariffs.length === 0 ? (
            <p className="text-sm text-slate-500">Cargando tarifas…</p>
          ) : (
            <div className="space-y-3">
              {tariffs.map(t => (
                <label
                  key={t.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer transition-shadow
                    ${selectedTariff?.id === t.id ? 'ring-2 ring-sky-100 shadow-md bg-sky-50' : 'hover:shadow hover:bg-sky-50'}`}
                >
                  <div>
                    <div className="font-medium text-slate-800">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.sessions ? `${t.sessions} sesiones · ` : ''}{t.duration_minutes} min</div>
                  </div>

                  <div className="text-right">
                    <div className="font-medium text-slate-800">{t.price_cents ? `${(t.price_cents/100).toFixed(2)}€` : 'Gratis'}</div>
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
                      }}
                    />
                  </div>
                </label>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedTariff && (
        <div className="mt-6 bg-white border border-emerald-50 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end md:gap-4 gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700">Selecciona una fecha</label>
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
                className={`btn-soft inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium shadow-sm transition
                  ${!date || loadingSlots ? 'bg-gray-200 text-slate-500 cursor-not-allowed' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'}`}
              >
                {loadingSlots ? 'Buscando…' : 'Ver horarios disponibles'}
              </button>

              <button
                onClick={() => { setDate(''); setAvailableSlots([]) }}
                className="btn-soft inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 bg-gray-100 text-slate-700 hover:bg-gray-200"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="mt-4">
            {availableSlots.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableSlots.map(slot => (
                  <li key={`${slot.start_at}-${slot.end_at}`} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-white to-sky-50 border border-sky-100">
                    <div>
                      <div className="font-medium text-slate-800">{formatTimeRange(slot)}</div>
                      {slot.extra && <div className="text-xs text-slate-500">{slot.extra}</div>}
                    </div>
                    <button
                      onClick={() => handleReserve(slot)}
                      className="btn-soft ml-4 inline-flex items-center px-3 py-1.5 rounded-md bg-gray-100 text-slate-700 hover:bg-gray-200"
                    >
                      Reservar
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              date && (
                <p className="text-sm text-slate-500 mt-4">No hay horarios disponibles.</p>
              )
            )}
          </div>
        </div>
      )}

      <footer className="mt-6 text-center text-xs text-slate-400">
        <div>© 2025 Fernando Escalona</div>
      </footer>
    </div>
  )
}

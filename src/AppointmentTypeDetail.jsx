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

  // Cargar datos del tipo y masajistas disponibles
  useEffect(() => {
    const loadData = async () => {
      try {
        const type = await getAppointmentTypeById(typeId)
        setAppointmentType(type)

        const staff = await getAvailableStaffForType(typeId)
        setStaffMembers(staff)
      } catch (error) {
        console.error('Error cargando datos:', error.message)
      }
    }
    loadData()
  }, [typeId])

  // Cargar tarifas cuando se selecciona un masajista
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

  // Calcular slots según la tarifa y masajista seleccionados
  const fetchSlots = async () => {
    if (!selectedTariff || !selectedStaff) {
      alert('Selecciona primero un masajista y una tarifa')
      return
    }
    try {
      const slots = await calculateAvailableSlots(typeId, date, selectedTariff.duration_minutes, selectedStaff.id)
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error cargando slots:', error.message)
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
      fetchSlots() // refrescar slots disponibles
    } catch (error) {
      alert('Error al reservar: ' + error.message)
    }
  }

  if (!appointmentType) return <p>Cargando...</p>

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <button onClick={() => navigate(-1)}>&lt; Volver</button>
      <h2>{appointmentType.name}</h2>

      <h3>Selecciona un masajista</h3>
      {staffMembers.length > 0 ? (
        <ul>
          {staffMembers.map(staff => (
            <li key={staff.id}>
              <label>
                <input
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
                />
                {staff.full_name}
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay masajistas disponibles para este tipo de cita.</p>
      )}

      {selectedStaff && (
        <>
          <h3>Selecciona una tarifa</h3>
          <ul>
            {tariffs.map(t => (
              <li key={t.id}>
                <label>
                  <input
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
                  {t.name} — {t.sessions ? `${t.sessions} sesiones` : '1 sesión'} — {t.duration_minutes} min — {t.price_cents ? `${t.price_cents / 100}€` : 'Gratis'}
                </label>
              </li>
            ))}
          </ul>
        </>
      )}

      {selectedTariff && (
        <div style={{ marginTop: '20px' }}>
          <label>Selecciona una fecha: </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button onClick={fetchSlots} disabled={!date}>
            Ver horarios disponibles
          </button>
        </div>
      )}

      {availableSlots.length > 0 ? (
        <ul style={{ marginTop: '20px' }}>
          {availableSlots.map(slot => (
            <li key={`${slot.start_at}-${slot.end_at}`}>
              {new Date(slot.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
              {new Date(slot.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              <button
                style={{ marginLeft: '10px' }}
                onClick={() => handleReserve(slot)}
              >
                Reservar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        selectedTariff && date && <p style={{ marginTop: '20px' }}>No hay horarios disponibles.</p>
      )}
    </div>
  )
}

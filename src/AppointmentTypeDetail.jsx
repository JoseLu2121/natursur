import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { calculateAvailableSlots } from './api/weeklySlots'
import { getAppointmentTypeById } from './api/appointmentTypes'

export default function AppointmentTypeDetail() {
  const { typeId } = useParams()
  const navigate = useNavigate()
  const [appointmentType, setAppointmentType] = useState(null)
  const [date, setDate] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])

  useEffect(() => {
    const fetchTypeData = async () => {
      const type = await getAppointmentTypeById(typeId)
      setAppointmentType(type)
    }
    fetchTypeData()
  }, [typeId])

  const fetchSlots = async () => {
    try {
      const slots = await calculateAvailableSlots(typeId, date)
      setAvailableSlots(slots)
      console.log(slots)
    } catch (error) {
      console.error('Error cargando slots:', error.message)
    }
  }

  if (!appointmentType) return <p>Cargando...</p>

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <button onClick={() => navigate(-1)}>&lt; Volver</button>
      <h2>{appointmentType.name}</h2>
      <p>Duración: {appointmentType.duration_minutes} minutos</p>

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

      {availableSlots.length > 0 ? (
        <ul style={{ marginTop: '20px' }}>
          {availableSlots.map((slot) => (
            <li key={slot.id}>
              {new Date(slot.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
              {new Date(slot.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              <button
                style={{ marginLeft: '10px' }}
                onClick={() => alert(`Reservar slot ${slot.id}`)}
              >
                Reservar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        date && <p style={{ marginTop: '20px' }}>No hay horarios disponibles.</p>
      )}
    </div>
  )
}

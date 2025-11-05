import { useEffect, useState } from 'react'
import { getAllAppointmentTypes } from './api/appointmentTypes'

export default function Dashboard() {
  const [appointmentTypes, setAppointmentTypes] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const types = await getAllAppointmentTypes()
        setAppointmentTypes(types)
      } catch (error) {
        console.error('Error cargando tipos:', error.message)
      }
    }
    loadData()
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>Tipos de Citas</h2>
      <ul>
        {appointmentTypes.map((type) => (
          <li key={type.id}>
            {type.name} – {type.duration_minutes} min
          </li>
        ))}
      </ul>
    </div>
  )
}

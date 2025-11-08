import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllAppointmentTypes } from './api/appointmentTypes'

export default function Dashboard({ session, onLogout }) {
  const [appointmentTypes, setAppointmentTypes] = useState([])
  const navigate = useNavigate()

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
    <div className="relative min-h-screen bg-gray-50 p-6">
      {/* 🔹 Botón de perfil arriba a la izquierda */}
      <button
        onClick={() => navigate('/profile')}
        className="absolute top-4 left-4 flex items-center gap-2 bg-white shadow-md hover:bg-gray-100 px-3 py-2 rounded-full transition"
      >
        {/* Puedes usar un emoji o un pequeño SVG */}
        <span role="img" aria-label="perfil" className="text-lg">
          👤
        </span>
      </button>

      <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">
          Bienvenido, {session.user.email}
        </h2>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm mt-2"
        >
          Cerrar sesión
        </button>

        <hr className="my-6" />

        <h3 className="text-lg font-medium mb-3 text-gray-700">Tipos de Citas</h3>
        <ul className="space-y-2">
          {appointmentTypes.map((type) => (
            <li key={type.id}>
              <Link
                to={`/appointment-type/${type.id}`}
                className="block bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2"
              >
                {type.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

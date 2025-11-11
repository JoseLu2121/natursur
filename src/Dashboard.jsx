import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllAppointmentTypes } from './api/appointmentTypes'
import { supabase } from './api/supabaseClient'

export default function Dashboard({ onLogout }) {
  const [appointmentTypes, setAppointmentTypes] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // 🔹 Verificar sesión al montar
  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        // Si no hay sesión, redirigir a login
        navigate('/login', { replace: true })
        return
      }

      setUser(user)
      setLoading(false)
    }

    fetchSession()
  }, [navigate])

  // 🔹 Cargar tipos de citas
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gray-50 p-6">

      <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">
          Bienvenido, {user.email}
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

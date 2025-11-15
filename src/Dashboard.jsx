import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllAppointmentTypes } from './api/appointmentTypes'
import { cancelAppointment, getAppointmentsByUser } from './api/appointments'
import { supabase } from './api/supabaseClient'

export default function Dashboard({ onLogout }) {
  const [appointmentTypes, setAppointmentTypes] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])


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
      const appts = await getAppointmentsByUser(user.id)
      setAppointments(appts)

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

  const handleCancel = async (id) => {
      if (!window.confirm('¿Seguro que deseas cancelar esta cita?')) return
      try {
        await cancelAppointment(id)
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
        )
      } catch (err) {
        alert('Error al cancelar la cita: ' + err.message)
      }
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
                key={type.id}
                to={`/appointment-type/${type.id}`}
                className="block border border-emerald-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5"
              >
                <div className="p-5 flex flex-col h-full">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-sky-900 mb-1">{type.name}</h4>
                    {type.description && (
                      <p className="text-sm text-slate-600 line-clamp-3">{type.description}</p>
                    )}
                  </div>
                  <div className="mt-4 text-right">
                    <span className="inline-block text-sm text-emerald-700 font-medium hover:underline">Reservar →</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-slate-500 text-sm col-span-full text-center py-10">No hay tipos de citas disponibles.</p>
          )}
        </div>

        <footer className="mt-10 text-center text-xs text-slate-400">© 2025 Natursur</footer>
      </div>

      <hr className="my-6" />


      <h3 className="text-xl font-semibold mb-2">Mis Citas</h3>

      {appointments.length === 0 ? (
        <p className="text-gray-500">No tienes citas registradas.</p>
      ) : (
        <ul className="space-y-3">
          {appointments.map((appt) => (
            <li
              key={appt.id}
              className="border rounded p-3 shadow-sm bg-white space-y-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">
                    {appt.appointment_type?.name || 'Sin tipo'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(appt.start_at).toLocaleString()} —{' '}
                    <span className="capitalize">{appt.status}</span>
                  </p>
                </div>
              </div>

              {appt.status !== 'cancelled' && appt.status !== 'completed' && (
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => navigate(`/appointments/edit/${appt.id}`)}
                  className="bg-yellow-400 text-white text-sm px-2 py-1 rounded hover:bg-yellow-500"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleCancel(appt.id)}
                  className="bg-red-500 text-white text-sm px-2 py-1 rounded hover:bg-red-600"
                >
                  Cancelar
                </button>
              </div>
            )}
            </li>
          ))}
        </ul>
      )}    

    </div>
  )
}

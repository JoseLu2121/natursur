// src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react'
import { getUserById, updateUser } from './api/user'
//import { getAppointmentsByUser, cancelAppointment, updateAppointment } from './api/appointments'
import ProfileButton from './ProfileButton.jsx'
//import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

export default function ProfilePage() {
  const { user } = useAuth() // 🔹 obtener usuario directamente del contexto
  //const navigate = useNavigate()
  const [userData, setUserData] = useState({ full_name: '', phone: '', role: '' })
  //const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  //const [editingId, setEditingId] = useState(null)
  //const [editingDate, setEditingDate] = useState('')

  // 🔹 Redirigir si no hay usuario
  if (!user) return <Navigate to="/login" replace />

  const userId = user.id
  const userEmail = user.email

  // 🔹 Cargar perfil y citas
  useEffect(() => {
    const loadData = async () => {
      try {
        const u = await getUserById(userId)
        setUserData({
          full_name: u.full_name || '',
          phone: u.phone || '',
          role: u.role || ''
        })

        //const appts = await getAppointmentsByUser(userId)
        //setAppointments(appts)
      } catch (error) {
        console.error('Error cargando perfil:', error.message)
      }
    }
    if (userId) loadData()
  }, [userId])

  // 🔹 Actualizar perfil
  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await updateUser(userId, userData)
      setMessage('✅ Información actualizada correctamente.')
    } catch (error) {
      setMessage('❌ Error al actualizar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }
  /*
  // 🔹 Cancelar cita
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
  
  // 🔹 Editar cita
  const handleEdit = async (id) => {
    if (!editingDate) return alert('Selecciona una nueva fecha y hora')
    try {
      const start = new Date(editingDate)
      const end = new Date(start.getTime() + 60 * 60 * 1000)
      await updateAppointment(id, { start_at: start.toISOString(), end_at: end.toISOString() })
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, start_at: start.toISOString(), end_at: end.toISOString() } : a
        )
      )
      setEditingId(null)
      setEditingDate('')
    } catch (err) {
      alert('Error al editar la cita: ' + err.message)
    }
  }
  */
  return (
    <div className="relative p-6 max-w-lg mx-auto">

      <h2 className="text-2xl font-semibold mb-2">Mi Perfil</h2>
      <p className="text-gray-600 mb-4">{userEmail}</p>

      <form onSubmit={handleSave} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Nombre completo</label>
          <input
            type="text"
            name="full_name"
            value={userData.full_name}
            onChange={handleChange}
            className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Teléfono</label>
          <input
            type="text"
            name="phone"
            value={userData.phone}
            onChange={handleChange}
            className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Rol</label>
          <input
            type="text"
            value={userData.role}
            disabled
            className="w-full border rounded p-2 bg-gray-100 text-gray-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>

        {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
      </form>
      {/*
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
      */}
    </div>
  )
}

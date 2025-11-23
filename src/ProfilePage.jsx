// src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getUserById, updateUser } from './api/user'
import ProfileButton from './ProfileButton.jsx'
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
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/70 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-8 shadow-2xl shadow-emerald-100">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">
              Perfil
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-gray-900">Hola, {userData.full_name || 'Natursur'}</h2>
            <p className="text-sm text-gray-500">{userEmail}</p>
            <div className="mt-4 inline-flex rounded-full border border-emerald-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
              {userData.role || 'CLIENTE'}
            </div>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-lg shadow-emerald-100">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400">Estado</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">Cuenta activa</p>
            <p className="text-sm text-gray-500">Tus datos están protegidos.</p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/80 bg-white/85 p-6 shadow-xl shadow-emerald-100 backdrop-blur">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Información personal</h3>
          <p className="text-sm text-gray-500">Actualiza tu nombre y teléfono para que podamos contactarte fácilmente.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-700">Nombre completo</label>
            <input
              type="text"
              name="full_name"
              value={userData.full_name}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-gray-900 shadow-inner shadow-gray-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Teléfono</label>
            <input
              type="text"
              name="phone"
              value={userData.phone}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-gray-900 shadow-inner shadow-gray-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Rol asignado</label>
            <input
              type="text"
              value={userData.role}
              disabled
              className="mt-2 w-full rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Guardando…' : 'Guardar cambios'}
            </button>
            {message && (
              <span className="text-sm font-semibold text-emerald-600">{message}</span>
            )}
          </div>
        </form>
      </section>
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

import { useState, useEffect } from 'react'
import { getUsers, createClient, deleteUser, updateUser } from './api/users'
import LoadingSpinner from './components/LoadingSpinner'
import ClientForm from './components/ClientForm'
import EditClientForm from './components/EditClientForm'

export default function Clients() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showClientForm, setShowClientForm] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [deletingUserId, setDeletingUserId] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUsers()
      // Filter only clients
      const clients = data.filter(user => user.role === 'client')
      setUsers(clients)
    } catch (error) {
      setError('Error cargando clientes: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async (clientData) => {
    try {
      const newClient = await createClient(clientData)
      setUsers(prev => [newClient, ...prev])
      setShowClientForm(false)
      alert('Cliente creado exitosamente')
    } catch (err) {
      console.error('Error creating client:', err)
      alert('Error al crear cliente: ' + err.message)
      throw err
    }
  }

  const handleUpdateClient = async (userId, clientData) => {
    try {
      const updatedClient = await updateUser(userId, clientData)
      setUsers(prev => prev.map(user => user.id === userId ? updatedClient : user))
      setEditingClient(null)
      alert('Cliente actualizado exitosamente')
    } catch (err) {
      console.error('Error updating client:', err)
      alert('Error al actualizar cliente: ' + err.message)
      throw err
    }
  }

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm('¿Eliminar este cliente? Esta acción no se puede deshacer.')
    if (!confirmed) return

    try {
      setDeletingUserId(userId)
      await deleteUser(userId)
      setUsers(prev => prev.filter(user => user.id !== userId))
    } catch (err) {
      console.error('Error eliminando cliente:', err)
      alert('No se pudo eliminar el cliente: ' + err.message)
    } finally {
      setDeletingUserId(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-3xl border border-white/70 bg-white/90 px-6 py-4 shadow-xl shadow-emerald-100">
          <LoadingSpinner size={4} className="text-emerald-500" />
          <p className="text-sm font-semibold text-emerald-700">Cargando clientes…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="rounded-[32px] border border-white/70 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-8 shadow-2xl shadow-emerald-100">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">
              Natursur · Clientes
            </p>
            <h1 className="text-3xl font-semibold text-gray-900">Gestión de clientes</h1>
            <p className="max-w-2xl text-sm text-gray-500">
              Administra la base de datos de clientes y crea nuevos perfiles manualmente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-2 text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{users.length}</span> clientes
            </div>

            <button
              onClick={() => setShowClientForm(true)}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-emerald-100 bg-white/80 px-5 py-2.5 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5"
            >
              <span
                className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 opacity-95"
                aria-hidden="true"
              />
              <span className="relative inline-flex items-center gap-2 text-white">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
                </svg>
                Añadir cliente manual
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* CLIENTS TABLE */}
      <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-xl shadow-emerald-50">
        {users.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <p className="text-lg font-semibold">No hay clientes registrados</p>
            <p className="mt-2 text-sm">Añade tu primer cliente con el botón de arriba.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-emerald-100 bg-emerald-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Teléfono
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Fecha de registro
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr
                    key={user.id}
                    onClick={() => setEditingClient(user)}
                    className="cursor-pointer transition hover:bg-emerald-50/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                          {user.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.full_name || 'Sin nombre'}</p>
                          <p className="text-sm text-gray-500">{user.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.phone || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.created_at ? formatDate(user.created_at) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteUser(user.id)
                        }}
                        disabled={deletingUserId === user.id}
                        className="inline-flex items-center gap-1 rounded-full border border-red-100 px-3 py-1 text-xs font-semibold text-red-500 transition hover:-translate-y-0.5 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingUserId === user.id ? 'Eliminando…' : 'Eliminar'}
                        <svg
                          className="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 7h12M9 7v10m6-10v10M10 7l1-3h2l1 3"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CLIENT FORM MODAL */}
      {showClientForm && (
        <ClientForm
          onClientCreated={handleCreateClient}
          onCancel={() => setShowClientForm(false)}
        />
      )}

      {/* EDIT CLIENT FORM MODAL */}
      {editingClient && (
        <EditClientForm
          client={editingClient}
          onClientUpdated={handleUpdateClient}
          onCancel={() => setEditingClient(null)}
        />
      )}
    </div>
  )
}

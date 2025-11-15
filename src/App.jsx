// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from './api/supabaseClient'

// Components & Pages
import DashboardWrapper from './DashboardWrapper'
import AppointmentTypeDetail from './AppointmentTypeDetail'
import MyAppointments from './MyAppointments'
import ProfilePage from './ProfilePage'
import EditAppointmentPage from './EditAppointmentPage'
import NavBar from './components/NavBar'
import Home from './Home'
import Shop from './Shop'
import Stock from './Stock'
import LoginPage from './LoginPage'
import { supabase } from './api/supabaseClient'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    )
// Component to protect admin/staff routes
function AdminRoute({ session, children }) {
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (!error && (data?.role === 'admin' || data?.role === 'staff')) {
            setUserRole(data.role)
          }
        } catch (err) {
          console.error('Error fetching user role:', err)
        }
      }
      setLoading(false)
    }

    fetchUserRole()
  }, [session])

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: '/stock' }} />
  }

  if (userRole !== 'admin' && userRole !== 'staff') {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceso denegado</h2>
        <p className="text-gray-600">Solo los administradores y staff pueden acceder a esta sección</p>
      </div>
    )
  }

  return children
}

export default function App() {
  const [session, setSession] = useState(null)

  if (!user) return <Navigate to="/login" replace />

  return children
}

function AppContent() {
  const { user } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <NavBar session={user} onLogout={handleLogout} />

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-primary-100 overflow-hidden p-6">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/citas"
              element={
                <PrivateRoute>
                  <DashboardWrapper />
                </PrivateRoute>
              }
            />

            <Route
              path="/appointment-type/:typeId"
              element={
                <PrivateRoute>
                  <AppointmentTypeDetail />
                </PrivateRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />

            <Route
              path="/appointments/edit/:appointmentId"
              element={
                <PrivateRoute>
                  <EditAppointmentPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/stock"
              element={
                <PrivateRoute>
                  <Shop />
                </PrivateRoute>
              }
            />

            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
                <AdminRoute session={session}>
                  <Stock />
                </AdminRoute>
              }
            />

            <Route
              path="/my-appointments"
              element={<MyAppointments session={session} />}
            />

            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  )
}

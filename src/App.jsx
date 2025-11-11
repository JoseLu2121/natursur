// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import DashboardWrapper from './DashboardWrapper'
import AppointmentTypeDetail from './AppointmentTypeDetail'
import ProfilePage from './ProfilePage'
import EditAppointmentPage from './EditAppointmentPage'
import NavBar from './components/NavBar'
import Home from './Home'
import Shop from './Shop'
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
              path="/store"
              element={
                <PrivateRoute>
                  <Shop />
                </PrivateRoute>
              }
            />

            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
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

import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'
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
import OrderPage from './OrderPage'


// 1. PrivateRoute actualizado: Usa 'loading' del contexto para evitar parpadeos
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// 2. AdminRoute actualizado: 
// Ya NO hace consultas a Supabase. Usa el 'role' que ya cargó el AuthContext.
function AdminRoute({ children }) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return <div className="text-center py-12">Cargando permisos...</div>
  }

  // Si no hay usuario, al login (y luego volver a /stock)
  if (!user) {
    return <Navigate to="/login" replace state={{ from: '/stock' }} />
  }

  // Si el rol no es el adecuado, mostramos acceso denegado
  if (role !== 'admin' && role !== 'staff') {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceso denegado</h2>
        <p className="text-gray-600">No tienes permisos para ver esta sección ({role})</p>
      </div>
    )
  }

  return children
}

function AppContent() {
  const { user } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-emerald-200 opacity-40 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-lime-200 opacity-40 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-100 opacity-50 blur-2xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <NavBar />

        <main className="flex-1 px-4 pb-12 pt-6">
          <div className="mx-auto w-full max-w-6xl rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-emerald-100 backdrop-blur">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/citas" element={<PrivateRoute><DashboardWrapper onLogout={handleLogout} /></PrivateRoute>} />
              <Route path="/appointment-type/:typeId" element={<PrivateRoute><AppointmentTypeDetail /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/appointments/edit/:appointmentId" element={<PrivateRoute><EditAppointmentPage /></PrivateRoute>} />
              <Route path="/store" element={<PrivateRoute><Shop /></PrivateRoute>} />
              <Route path="/stock" element={<AdminRoute><Stock /></AdminRoute>} />
              <Route path="/orders" element={<AdminRoute><OrderPage /></AdminRoute>} />
              <Route path="/my-appointments" element={<PrivateRoute><MyAppointments session={{ user }} /></PrivateRoute>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        <footer className="pb-6 text-center text-sm text-emerald-700">
          © {new Date().getFullYear()} Natursur · Bienestar natural
        </footer>
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
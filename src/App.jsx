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
    // AÑADIDO: w-full para asegurar que ocupe todo el ancho
    <div className="min-h-screen bg-primary-50 w-full">
      <NavBar />

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-primary-100 overflow-hidden p-6">
          <Routes>
            {/* ... tus rutas ... */}
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
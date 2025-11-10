import { Routes, Route, Navigate } from 'react-router-dom'
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
import LoginPage from './LoginPage'

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <NavBar session={session} onLogout={handleLogout} />

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-primary-100 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/citas"
              element={
                session ? (
                  <DashboardWrapper session={session} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace state={{ from: '/citas' }} />
                )
              }
            />

            <Route
              path="/appointment-type/:typeId"
              element={
                session ? (
                  <AppointmentTypeDetail />
                ) : (
                  <Navigate to="/login" replace state={{ from: '/appointment-type' }} />
                )
              }
            />

            <Route
              path="/profile"
              element={
                session ? (
                  <ProfilePage session={session} />
                ) : (
                  <Navigate to="/login" replace state={{ from: '/profile' }} />
                )
              }
            />

            <Route
              path="/appointments/edit/:appointmentId"
              element={
                session ? (
                  <EditAppointmentPage />
                ) : (
                  <Navigate to="/login" replace state={{ from: '/appointments/edit' }} />
                )
              }
            />

            <Route
              path="/store"
              element={
                session ? (
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tienda</h2>
                    <p className="text-gray-600">(próximamente)</p>
                  </div>
                ) : (
                  <Navigate to="/login" replace state={{ from: '/store' }} />
                )
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

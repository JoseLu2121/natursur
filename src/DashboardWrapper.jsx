import { useState, useEffect } from 'react'
import { supabase } from './api/supabaseClient'
import Dashboard from './Dashboard'
import StaffDashboard from './StaffDashboard'
import LoadingSpinner from './components/LoadingSpinner'
import { useAuth } from "./context/AuthContext"

export default function DashboardWrapper({ onLogout }) {
  const { user } = useAuth()
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    
    if (!user) {
      return 
    }
    
    const fetchUserRole = async () => {
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setUserRole(userData.role)
      } catch (error) {
        console.error('Error fetching user role:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [user])

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-3xl border border-white/70 bg-white/90 px-6 py-4 shadow-xl shadow-emerald-100">
          <LoadingSpinner size={4} className="text-emerald-500" />
          <p className="text-sm font-semibold text-emerald-700">Cargando tu panel…</p>
        </div>
      </div>
    )
  }

  if (userRole === 'staff') {
    return <StaffDashboard session={user} />
  }

  return <Dashboard session={user} onLogout={onLogout} />
}
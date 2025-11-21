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
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size={6} className="text-primary-600" />
      </div>
    )
  }

  if (userRole === 'staff') {
    return <StaffDashboard session={user} />
  }

  return <Dashboard session={user} onLogout={onLogout} />
}
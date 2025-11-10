import { useState, useEffect } from 'react'
import { supabase } from './api/supabaseClient'
import Dashboard from './Dashboard'
import StaffDashboard from './StaffDashboard'
import LoadingSpinner from './components/LoadingSpinner'

export default function DashboardWrapper({ session, onLogout }) {
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
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
  }, [session])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size={6} className="text-primary-600" />
      </div>
    )
  }

  if (userRole === 'staff') {
    return <StaffDashboard session={session} />
  }

  return <Dashboard session={session} onLogout={onLogout} />
}
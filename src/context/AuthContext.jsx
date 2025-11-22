// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null) // 🆕 Estado para el rol
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true;

    const fetchSessionAndRole = async () => {
      try {
        // 1. Obtener sesión actual
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          await fetchUserRole(session.user.id)
        } else {
          setUser(null)
          setRole(null)
        }
      } catch (error) {
        console.error('Error inicializando auth:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchSessionAndRole()

    // 2. Escuchar cambios (Login, Logout, Auto-refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        // Solo buscamos el rol si el usuario ha cambiado o no tenemos rol aún
        if (user?.id !== session.user.id) { 
           await fetchUserRole(session.user.id)
        }
      } else {
        setUser(null)
        setRole(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  // Función auxiliar para buscar el rol en la tabla 'users'
  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (!error && data) {
        setRole(data.role)
      } else {
        setRole('client') // Rol por defecto si falla
      }
    } catch (err) {
      console.error('Error obteniendo rol:', err)
      setRole('client')
    }
  }

  // Función de Logout centralizada
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Dashboard from './Dashboard'
import AppointmentTypeDetail from './AppointmentTypeDetail'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export default function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

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

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setErrorMessage(error.message)
    setLoading(false)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setErrorMessage(error.message)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (!session) {
    return (
      <div style={{ maxWidth: 400, margin: 'auto' }}>
        <h2>Login o Registro</h2>
        
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', margin: '8px 0', padding: '8px' }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', margin: '8px 0', padding: '8px' }}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar sesión'}
          </button>
        </form>

        <hr />
        <button onClick={handleSignUp} disabled={loading}>
          Registrarse
        </button>
      </div>
    )
  }

    return (
    <div className="app-container">
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-full max-w-6xl p-4 md:p-8">
          <Routes>
            <Route
              path="/"
              element={<Dashboard session={session} onLogout={handleLogout} />}
            />
            <Route
              path="/appointment-type/:typeId"
              element={<AppointmentTypeDetail />}
            />
          </Routes>
        </div>
      </div>
    </div>
  )
}

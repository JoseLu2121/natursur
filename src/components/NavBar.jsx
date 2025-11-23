import { Fragment, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { useAuth } from '../context/AuthContext'

const baseLink = 'inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold transition'

function Avatar({ user, onLogout }) {
  const navigate = useNavigate()
  if (!user) return null

  const name = user.user_metadata?.full_name || user.email || 'Natursur'
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Menu as="div" className="relative ml-4">
      <Menu.Button className="flex items-center gap-3 rounded-full border border-white/50 bg-white/80 px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-lg shadow-emerald-100 backdrop-blur">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-lime-500 text-white">
          {initials}
        </div>
        <span className="hidden sm:inline">{name}</span>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-20 mt-3 w-56 origin-top-right rounded-2xl border border-white/70 bg-white/95 p-2 shadow-2xl shadow-emerald-100 backdrop-blur">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => navigate('/profile')}
                className={`w-full rounded-xl px-4 py-2 text-left text-sm font-medium ${active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'}`}
              >
                Mi Perfil
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onLogout}
                className={`w-full rounded-xl px-4 py-2 text-left text-sm font-medium ${active ? 'bg-red-50 text-red-600' : 'text-gray-700'}`}
              >
                Cerrar sesión
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default function NavBar() {
  const navigate = useNavigate()
  const { user, role, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isStaffOrAdmin = role === 'admin' || role === 'staff'

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    { to: '/', label: 'Inicio', end: true },
    { to: '/citas', label: 'Citas' },
    { to: '/store', label: 'Tienda' }
  ]

  const staffLinks = [
    { to: '/stock', label: 'Stock' },
    { to: '/orders', label: 'Pedidos' }
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-emerald-600 shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5 hover:shadow-emerald-200 sm:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <span className="sr-only">Abrir menú</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <NavLink to="/" className="flex items-center gap-2 text-2xl font-semibold text-emerald-900">
            <span className="rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-500 px-3 py-1 text-white shadow-lg shadow-emerald-200">
              N
            </span>
            Natursur
          </NavLink>
        </div>

        <nav className="hidden items-center gap-2 sm:flex">
          {[...navItems, ...(isStaffOrAdmin ? staffLinks : [])].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? 'bg-white text-emerald-600 shadow-inner shadow-emerald-100' : 'text-gray-500 hover:text-gray-900 hover:bg-white/70'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center">
          {user ? (
            <Avatar user={user} onLogout={handleLogout} />
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-emerald-100 bg-white/80 px-5 py-2 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-emerald-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 opacity-90 transition group-hover:scale-105" aria-hidden="true" />
              <span className="relative inline-flex items-center gap-2 text-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0-4-4m4 4-4 4" />
                </svg>
                Iniciar sesión
              </span>
            </button>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/60 bg-white/90 px-4 pb-6 pt-4 shadow-xl shadow-emerald-100 sm:hidden">
          <div className="flex flex-col gap-2">
            {[...navItems, ...(isStaffOrAdmin ? staffLinks : [])].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `${baseLink} w-full ${isActive ? 'bg-emerald-100 text-emerald-800' : 'text-gray-600 hover:bg-white'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {!user && (
              <button
                className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-emerald-100 bg-white/90 px-5 py-3 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5"
                onClick={() => {
                  navigate('/login')
                  setMobileMenuOpen(false)
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 opacity-95" aria-hidden="true" />
                <span className="relative inline-flex items-center gap-2 text-white">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0-4-4m4 4-4 4" />
                  </svg>
                  Iniciar sesión
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
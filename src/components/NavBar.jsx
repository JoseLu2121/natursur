import { Fragment, useState } from 'react' // Quitamos useEffect
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { useAuth } from '../context/AuthContext' // Usamos tu hook personalizado

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Avatar({ user, onLogout }) { // Recibe user directamente
  const navigate = useNavigate()
  if (!user) return null
  
  const name = user.user_metadata?.full_name || user.email || 'U'
  const initials = name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <Menu as="div" className="relative ml-3">
      <Menu.Button className="flex rounded-full bg-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600">
        <span className="sr-only">Abrir menú de usuario</span>
        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
          {initials}
        </div>
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <button onClick={() => navigate('/profile')} className={classNames(active ? 'bg-gray-100' : '', 'block w-full px-4 py-2 text-left text-sm text-gray-700')}>
                Mi Perfil
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button onClick={onLogout} className={classNames(active ? 'bg-gray-100' : '', 'block w-full px-4 py-2 text-left text-sm text-gray-700')}>
                Cerrar sesión
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default function NavBar() { // Ya no necesita props, usa el contexto
  const navigate = useNavigate()
  const { user, role, signOut } = useAuth() // Consumimos todo del contexto
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  // Lógica de visualización
  const isStaffOrAdmin = role === 'admin' || role === 'staff'

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Abrir menú</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <NavLink to="/" className="text-xl font-bold text-primary-600">Natursur</NavLink>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink to="/" end className={({ isActive }) => classNames(isActive ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700', 'inline-flex items-centerXH border-b-2 px-1 pt-1 text-sm font-medium')}>
                Home
              </NavLink>
              <NavLink to="/citas" className={({ isActive }) => classNames(isActive ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700', 'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium')}>
                Citas
              </NavLink>
              
              {/* SIEMPRE visible */}
              <NavLink to="/store" className={({ isActive }) => classNames(isActive ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700', 'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium')}>
                Tienda
              </NavLink>

              {/* SOLO Admin/Staff */}
              {isStaffOrAdmin && (
                <>
                  <NavLink
                    to="/stock"
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                      )
                    }
                  >
                    Stock
                  </NavLink>
                  
                  {/* NUEVO ENLACE DE PEDIDOS */}
                  <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                      )
                    }
                  >
                    Pedidos
                  </NavLink>
                </>
              )}

              

            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {user ? (
              <Avatar user={user} onLogout={handleLogout} />
            ) : (
              <button onClick={() => navigate('/login')} className="btn-primary">Iniciar sesión</button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="space-y-1 pb-3 pt-2">
          <NavLink to="/" end onClick={() => setMobileMenuOpen(false)} className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700">Home</NavLink>
          <NavLink to="/citas" onClick={() => setMobileMenuOpen(false)} className="blockXB border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700">Citas</NavLink>
          <NavLink to="/store" onClick={() => setMobileMenuOpen(false)} className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700">Tienda</NavLink>
          {isStaffOrAdmin && (
             <NavLink to="/stock" onClick={() => setMobileMenuOpen(false)} className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700">Stock</NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}
import { useState, useEffect } from 'react'
import { getProducts, createOrder } from './api/products'
import { useCart } from './context/CartContext'
import { useAuth } from './context/AuthContext'
import LoadingSpinner from './components/LoadingSpinner'
import { useNavigate } from 'react-router-dom'

export default function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCart, setShowCart] = useState(false)
  
  const { addToCart, cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()

  const [ordering, setOrdering] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      setError('Error cargando productos: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product) => {
    addToCart(product, 1)
  }

  const handleCheckout = async () => {
    if (!user) return alert('Debes iniciar sesión para comprar')
    
    try {
      setOrdering(true)
      
      const itemsToOrder = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price_cents: item.price_cents
      }))

      await createOrder(user.id, itemsToOrder)

      clearCart()
      alert('¡Pedido realizado con éxito! Te contactaremos pronto.')
      setShowCart(false)

    } catch (err) {
      console.error(err)
      alert('Error al realizar el pedido: ' + err.message)
    } finally {
      setOrdering(false)
    }
  }

  const formatPrice = (cents) => {
    return (cents / 100).toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
    })
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-white/70 bg-white/80">
        <LoadingSpinner size={6} className="text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-600">Catálogo</p>
          <h1 className="text-3xl font-semibold text-gray-900">Tienda Natursur</h1>
          <p className="mt-1 text-sm text-gray-500">
            Productos de salud y bienestar curados por terapeutas.
          </p>
        </div>
        <button
          onClick={() => setShowCart(!showCart)}
          className="btn-primary relative shadow-xl shadow-emerald-200"
        >
          Carrito ({cartItems.length})
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showCart ? (
        <CartView
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          getTotalPrice={getTotalPrice}
          formatPrice={formatPrice}
          onCheckout={handleCheckout}
          ordering={ordering}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No hay productos disponibles en el catálogo.</p>
            </div>
          ) : (
            products.map(product => (
              <div
                key={product.id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-lg shadow-emerald-50 transition hover:-translate-y-1"
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                    {product.description || 'Sin descripción disponible'}
                  </p>
                  
                  {/* CAMBIO: Eliminada la lógica visual de stock */}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-2xl font-semibold text-emerald-600">
                      {formatPrice(product.price_cents)}
                    </span>
                  </div>

                  {/* CAMBIO: Botón siempre habilitado */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn-primary mt-3 w-full justify-center"
                  >
                    Añadir al carrito
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function CartView({ cartItems, removeFromCart, updateQuantity, getTotalPrice, formatPrice, onCheckout, ordering }) {
  return (
    <div className="space-y-6 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-xl shadow-emerald-100">
      <h2 className="text-2xl font-semibold text-gray-900">Mi carrito</h2>

      {cartItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 py-12 text-center text-gray-500">
          Tu carrito está vacío
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/90 p-4 shadow"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatPrice(item.price_cents)} · {item.quantity} uds.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="text-lg leading-none text-gray-600"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-lg leading-none text-gray-600"
                    >
                      +
                    </button>
                  </div>
                  <p className="min-w-[5rem] text-right text-lg font-semibold text-gray-900">
                    {formatPrice(item.price_cents * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-sm font-semibold text-red-500 hover:text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-emerald-600">{formatPrice(getTotalPrice())}</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            disabled={ordering}
            className="btn-primary w-full justify-center py-3 text-base font-semibold shadow-lg shadow-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {ordering ? 'Procesando...' : 'Confirmar pedido'}
          </button>
        </>
      )}
    </div>
  )
}
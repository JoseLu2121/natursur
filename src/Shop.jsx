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
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size={6} className="text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tienda</h1>
          <p className="mt-2 text-sm text-gray-700">
            Explora nuestros productos de salud y bienestar
          </p>
        </div>
        <button
          onClick={() => setShowCart(!showCart)}
          className="btn-primary relative"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No hay productos disponibles en el catálogo.</p>
            </div>
          ) : (
            products.map(product => (
              <div
                key={product.id}
                className="border border-primary-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover bg-gray-100"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description || 'Sin descripción disponible'}
                  </p>
                  
                  {/* CAMBIO: Eliminada la lógica visual de stock */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-primary-600">
                      {formatPrice(product.price_cents)}
                    </span>
                  </div>

                  {/* CAMBIO: Botón siempre habilitado */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full btn-primary"
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
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Mi Carrito</h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-gray-500">Tu carrito está vacío</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div
                key={item.id}
                className="border border-primary-200 rounded-lg p-4 flex justify-between items-center bg-white"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatPrice(item.price_cents)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-4 py-1">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-semibold text-gray-900 min-w-24 text-right">
                    {formatPrice(item.price_cents * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-800 font-semibold text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span className="text-gray-900">Total:</span>
              <span className="text-primary-600">{formatPrice(getTotalPrice())}</span>
            </div>
          </div>

          <button 
            onClick={onCheckout}
            disabled={ordering}
            className="w-full btn-primary py-3 text-lg"
          >
            {ordering ? 'Procesando...' : 'Confirmar Pedido'}
          </button>
        </>
      )}
    </div>
  )
}
import { useState, useEffect, useRef } from "react";
import { getProducts, createOrder, deleteProduct } from "./api/products";
import { useCart } from "./context/CartContext";
import { useAuth } from "./context/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";
import ProductForm from "./components/ProductForm";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [pulseProduct, setPulseProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const pulseTimeout = useRef(null);

  const {
    addToCart,
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    clearCart,
  } = useCart();
  const { user, role } = useAuth();
  const [ordering, setOrdering] = useState(false);
  const isStaffOrAdmin = role === "admin" || role === "staff";

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    return () => {
      if (pulseTimeout.current) {
        clearTimeout(pulseTimeout.current);
      }
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      setError("Error cargando productos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setPulseProduct(product.id);
    if (pulseTimeout.current) {
      clearTimeout(pulseTimeout.current);
    }
    pulseTimeout.current = setTimeout(() => setPulseProduct(null), 1000);
  };

  const handleCheckout = async () => {
    if (!user) return alert("Debes iniciar sesión para comprar");

    try {
      setOrdering(true);

      const itemsToOrder = cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price_cents: item.price_cents,
      }));

      await createOrder(user.id, itemsToOrder);

      clearCart();
      alert("¡Pedido realizado con éxito! Te contactaremos pronto.");
      setShowCart(false);
    } catch (err) {
      console.error(err);
      alert("Error al realizar el pedido: " + err.message);
    } finally {
      setOrdering(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm(
      "¿Quieres eliminar este producto de la tienda?",
    );
    if (!confirmed) return;

    try {
      setDeletingProductId(productId);
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (err) {
      console.error("Error eliminando producto:", err);
      alert("No se pudo eliminar el producto: " + err.message);
    } finally {
      setDeletingProductId(null);
    }
  };

  const formatPrice = (cents) => {
    return (cents / 100).toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR",
    });
  };

  const cartButtonLabel = showCart
    ? "Volver a la tienda"
    : `Ver carrito (${cartItems.length})`;
  const cartButtonClasses = showCart
    ? "inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-white/90 px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-md shadow-emerald-50 transition hover:-translate-y-0.5"
    : "inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400 px-5 py-2.5 text-sm font-semibold text-white shadow-xl shadow-emerald-200 transition hover:-translate-y-0.5";
  const cartIconClasses = showCart
    ? "inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-600"
    : "inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-lg text-white";

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-3xl border border-white/70 bg-white/90 px-6 py-4 shadow-xl shadow-emerald-100">
          <LoadingSpinner size={4} className="text-emerald-500" />
          <p className="text-sm font-semibold text-emerald-700">
            Cargando catálogo…
          </p>
        </div>
      </div>
    );
  }

  const handleProductCreated = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    setShowProductForm(false);
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="rounded-[32px] border border-white/70 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-8 shadow-2xl shadow-emerald-100">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">
              Natursur · Shop
            </p>
            <h1 className="text-3xl font-semibold text-gray-900">
              Tienda de bienestar Natursur
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl">
              Selección curada de productos naturales, aceites y rituales para
              extender tus sesiones en casa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-2 text-sm text-gray-500">
              <span className="font-semibold text-gray-900">
                {products.length}
              </span>{" "}
              productos
            </div>

            {isStaffOrAdmin ? (
              <button
                onClick={() => setShowProductForm(true)}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-emerald-100 bg-white/80 px-5 py-2.5 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5"
              >
                <span
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 opacity-95"
                  aria-hidden="true"
                />
                <span className="relative inline-flex items-center gap-2 text-white">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 5v14m-7-7h14"
                    />
                  </svg>
                  Añadir nuevo producto
                </span>
              </button>
            ) : (
              <button
                onClick={() => setShowCart(!showCart)}
                className={cartButtonClasses}
              >
                <span aria-hidden="true" className={cartIconClasses}>
                  🛒
                </span>
                <span>{cartButtonLabel}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* CART OR LIST */}
      {!isStaffOrAdmin && showCart ? (
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
            <div className="col-span-full rounded-3xl border border-dashed border-emerald-200 bg-white/80 py-16 text-center text-gray-500">
              Próximamente añadiremos nuevos productos rituales.
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="flex h-full flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-xl shadow-emerald-50 transition hover:-translate-y-1"
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-48 w-full object-cover transition duration-500 hover:scale-105"
                  />
                )}

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                      Natural
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                    {product.description || "Sin descripción disponible"}
                  </p>

                  <div className="mt-auto pt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-semibold text-emerald-600">
                        {formatPrice(product.price_cents)}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs uppercase tracking-[0.3em] text-gray-400">
                          Stock activo
                        </span>
                        {isStaffOrAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deletingProductId === product.id}
                            className="inline-flex items-center gap-1 rounded-full border border-red-100 px-3 py-1 text-xs font-semibold text-red-500 transition hover:-translate-y-0.5 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingProductId === product.id
                              ? "Eliminando…"
                              : "Eliminar"}
                            <svg
                              className="h-3.5 w-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 7h12M9 7v10m6-10v10M10 7l1-3h2l1 3"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {pulseProduct === product.id && (
                      <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-emerald-600">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          ✓
                        </span>
                        Añadido al carrito
                      </p>
                    )}

                    {!isStaffOrAdmin && (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 ${
                          pulseProduct === product.id
                            ? "ring-2 ring-emerald-200 shadow-emerald-400 scale-[1.01] animate-pulse"
                            : ""
                        }`}
                      >
                        {pulseProduct === product.id
                          ? "Añadido"
                          : "Añadir al carrito"}
                        <span aria-hidden="true">
                          {pulseProduct === product.id ? "✓" : "＋"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isStaffOrAdmin && showProductForm && (
        <ProductForm
          onProductCreated={handleProductCreated}
          onCancel={() => setShowProductForm(false)}
        />
      )}
    </div>
  );
}

function CartView({
  cartItems,
  removeFromCart,
  updateQuantity,
  getTotalPrice,
  formatPrice,
  onCheckout,
  ordering,
}) {
  return (
    <div className="space-y-6 rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-emerald-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
            Carrito
          </p>
          <h2 className="text-2xl font-semibold text-gray-900">
            Mis productos seleccionados
          </h2>
        </div>

        <span className="rounded-full border border-emerald-100 bg-emerald-50/60 px-4 py-1 text-sm font-semibold text-emerald-700">
          {cartItems.length} artículos
        </span>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 py-12 text-center text-gray-500">
          Tu carrito está vacío
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/95 p-4 shadow"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatPrice(item.price_cents)} · {item.quantity} uds.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/50 px-3 py-1 text-emerald-700">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="text-lg leading-none"
                    >
                      −
                    </button>

                    <span className="w-8 text-center font-semibold text-gray-900">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-lg leading-none"
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

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-emerald-700">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            disabled={ordering}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {ordering ? "Procesando pedido…" : "Confirmar pedido"}
          </button>
        </>
      )}
    </div>
  );
}

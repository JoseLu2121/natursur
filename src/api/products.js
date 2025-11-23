import { supabase } from './supabaseClient'

// ✅ Bucket configuration
// ⚠️ Mantén el mismo nombre si ya existe, pero considera renombrar a 'shop-images' para evitar errores con espacios.
const PRODUCTS_BUCKET = 'Shop images'

// Fetch all products
export const getProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

// Fetch a single product by ID
export const getProduct = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

// Create an order
export const createOrder = async (userId, items) => {
  try {
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.unit_price_cents * item.quantity), 0)

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        status: 'pending',
        total_cents: total,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Add order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return order
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

// Get user's orders
export const getUserOrders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

// Get order items for a specific order
export const getOrderItems = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        products(*)
      `)
      .eq('order_id', orderId)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching order items:', error)
    throw error
  }
}

// Create a new product
export const createProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description,
        price_cents: parseInt(productData.price_cents),
        image_url: productData.image_url,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

// Update a product
export const updateProduct = async (productId, productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: productData.name,
        description: productData.description,
        price_cents: parseInt(productData.price_cents),
        image_url: productData.image_url,
      })
      .eq('id', productId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

// Delete a product
export const deleteProduct = async (productId) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

// ✅ Upload image to products bucket (signed URL valid for 1 year)
export const uploadProductImage = async (file) => {
  try {
    if (!file) throw new Error('No file provided')

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split('.').pop()
    const filename = `product-${timestamp}-${randomString}.${fileExtension}`

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(PRODUCTS_BUCKET)
      .upload(filename, file)

    if (uploadError) throw uploadError

    // Generate signed URL valid for 1 year (31,536,000 seconds)
    const oneYearInSeconds = 60 * 60 * 24 * 365

    const { data: signedData, error: signedError } = await supabase.storage
      .from(PRODUCTS_BUCKET)
      .createSignedUrl(filename, oneYearInSeconds)

    if (signedError) throw signedError

    // Return signed URL
    return signedData.signedUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Delete image from products bucket
export const deleteProductImage = async (imageUrl) => {
  try {
    // Extract filename from URL
    const filename = imageUrl.split('/').pop()

    const { error } = await supabase.storage
      .from(PRODUCTS_BUCKET)
      .remove([filename])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
}

export const getAllOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,  
        users (full_name, phone),  
        order_items!fk_order_items_orders (
          quantity,
          unit_price_cents,
          products!fk_order_items_products (
            name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching all orders:', error)
    throw error
  }
}

export const getInventory = async () => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        products (
          id,
          name,
          image_url,
          price_cents
        )
      `)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching inventory:', error)
    throw error
  }
}

// 🆕 Añadir un producto del catálogo al inventario
export const addProductToInventory = async (productId, quantity) => {
  try {
    // Upsert: Si ya existe, actualiza la cantidad (sumando? No, aquí definimos el stock inicial o reponemos)
    // Para simplificar, si ya existe, vamos a sumar la cantidad.
    
    // 1. Ver si ya existe
    const { data: existing } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', productId)
      .single()

    if (existing) {
      // Actualizamos sumando
      const { data, error } = await supabase
        .from('inventory')
        .update({ quantity: existing.quantity + parseInt(quantity) })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      // Creamos nueva entrada
      const { data, error } = await supabase
        .from('inventory')
        .insert({ product_id: productId, quantity: parseInt(quantity) })
        .select()
        .single()
      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('Error adding to inventory:', error)
    throw error
  }
}

// 🆕 Actualizar cantidad directamente (desde la tabla)
export const updateInventoryQuantity = async (inventoryId, newQuantity) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity: parseInt(newQuantity) })
      .eq('id', inventoryId)
      .select()
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating inventory:', error)
    throw error
  }
}

// 🆕 Eliminar del inventario (no borra el producto, solo lo saca del stock)
export const removeFromInventory = async (inventoryId) => {
  const { error } = await supabase.from('inventory').delete().eq('id', inventoryId)
  if (error) throw error
}

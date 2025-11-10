import { supabase } from './supabaseClient'

/**
 * Obtiene la información de un usuario por su ID
 * @param {string} userId - UUID del usuario
 * @returns {Promise<Object>} - Datos del usuario
 */
export const getUserById = async (userId) => {
  if (!userId) throw new Error('Falta userId')

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, phone, role, created_at, updated_at')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error obteniendo usuario:', error.message)
    throw new Error(error.message)
  }

  return data
}

/**
 * Actualiza la información de un usuario
 * @param {string} userId - UUID del usuario
 * @param {Object} updates - Campos a actualizar (por ejemplo: { full_name, phone })
 * @returns {Promise<Object>} - Usuario actualizado
 */
export const updateUser = async (userId, updates) => {
  if (!userId) throw new Error('Falta userId')
  if (!updates || typeof updates !== 'object') throw new Error('Faltan datos para actualizar')

  // Actualizar campos específicos del usuario
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error actualizando usuario:', error.message)
    throw new Error(error.message)
  }

  return data
}

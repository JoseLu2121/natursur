import { supabase } from './supabaseClient'

// Obtener todos los tipos de citas
export const getAllAppointmentTypes = async () => {
  const { data, error } = await supabase.from('appointment_types').select('*')
  if (error) throw new Error(error.message)
  return data
}

// Obtener tipo de cita por ID
export const getAppointmentTypeById = async (id) => {
  const { data, error } = await supabase
    .from('appointment_types')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

/**
 * Devuelve todas las tarifas asociadas a un tipo de cita.
 * @param {number} appointmentTypeId - ID del tipo de cita
 * @returns {Promise<Array>} - Lista de tarifas
 */
export const getTariffsByAppointmentType = async (appointmentTypeId) => {
  if (!appointmentTypeId) throw new Error('Falta appointmentTypeId')

  const { data, error } = await supabase
    .from('appointment_tariffs')
    .select('id, name, sessions, duration_minutes, price_cents')
    .eq('appointment_type_id', appointmentTypeId)

  if (error) {
    console.error('Error cargando tarifas:', error.message)
    throw error
  }

  return data
}

/**
 * Devuelve todos los masajistas disponibles para un tipo de cita específico
 * @param {number} appointmentTypeId - ID del tipo de cita
 * @returns {Promise<Array>} - Lista de masajistas
 */
export const getAvailableStaffForType = async (appointmentTypeId) => {
  if (!appointmentTypeId) throw new Error('Falta appointmentTypeId')

  // 1. Obtener todos los staff_id asociados al tipo de cita
  const { data: staffLinks, error: linksError } = await supabase
    .from('staff_appointment_type')
    .select('staff_id')
    .eq('type_id', appointmentTypeId)

  if (linksError) {
    console.error('Error cargando staff_appointment_type:', linksError.message)
    throw linksError
  }

  const staffIds = staffLinks.map(link => link.staff_id).filter(Boolean)
  if (!staffIds.length) return []

  // 2. Obtener los datos de los usuarios correspondientes
  const { data: staffMembers, error: usersError } = await supabase
    .from('users')
    .select('id, full_name').in('id', staffIds)

  console.log('Staff Members:', staffIds)

  if (usersError) {
    console.error('Error cargando usuarios:', usersError.message)
    throw usersError
  }

  return staffMembers || []
}

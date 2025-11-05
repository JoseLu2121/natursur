import { supabase } from './supabaseClient'

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
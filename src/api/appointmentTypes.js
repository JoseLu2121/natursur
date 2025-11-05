import { supabase } from './supabaseClient'

export const getAllAppointmentTypes = async () => {
  const { data, error } = await supabase.from('appointment_types').select('*')
  if (error) throw new Error(error.message)
  return data
}
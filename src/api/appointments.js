import { supabase } from './supabaseClient'

export const createAppointment = async ({ appointment_type_id, start_at, end_at }) => {
  const user = supabase.auth.getUser()
  if (!user) throw new Error('No estás autenticado')

  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        user_id: user.id,
        appointment_type_id,
        start_at,
        end_at,
        status: 'booked'
      }
    ])

  if (error) throw error
  return data
}

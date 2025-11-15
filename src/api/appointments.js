import { supabase } from './supabaseClient'

// 🔹 Crea una cita para el usuario autenticado
export const createAppointment = async ({ appointment_type_id, start_at, end_at, staffId, userId }) => {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('No estás autenticado')

  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        appointment_type_id,
        start_at,
        end_at,
        status: 'booked',
        staff_id: staffId,
        user_id: userId || user.id
      }
    ])
    .select()

  if (error) throw error
  return data
}

// 🔹 Crea múltiples citas a la vez
export const createMultipleAppointments = async (appointments) => {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('No estás autenticado')

  if (!Array.isArray(appointments) || appointments.length === 0)
    throw new Error('Debes enviar un array de citas')

  const formattedAppointments = appointments.map((appt) => ({
    user_id: appt.userId || user.id,
    appointment_type_id: appt.appointment_type_id,
    start_at: appt.start_at,
    end_at: appt.end_at,
    status: 'booked',
    staff_id: appt.staffId
  }))

  const { data, error } = await supabase.from('appointments').insert(formattedAppointments).select()

  if (error) throw error
  return data
}

// 🔹 Obtiene todas las citas de un usuario
export const getAppointmentsByUser = async (userId) => {
  if (!userId) throw new Error('Falta userId')

  const { data, error } = await supabase
    .from('appointments')
    .select(
      `
      id,
      start_at,
      end_at,
      status,
      appointment_type:appointment_types(name)
    `
    )
    .eq('user_id', userId)
    .order('start_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

// 🔹 Carga una cita por ID
export const loadAppointment = async (appointmentId) => {
  if (!appointmentId) throw new Error('Falta appointmentId')

  const { data, error } = await supabase
    .from('appointments')
    .select('id, appointment_type_id, staff_id, start_at, end_at, status')
    .eq('id', appointmentId)
    .single()

  if (error) throw error
  return data
}

// 🔹 Edita una cita (si pertenece al usuario actual)
export const updateAppointment = async (appointmentId, updates) => {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('No estás autenticado')

  const { data: existing, error: fetchError } = await supabase
    .from('appointments')
    .select('user_id, status')
    .eq('id', appointmentId)
    .single()

  if (fetchError) throw fetchError
  if (!existing) throw new Error('Cita no encontrada')
  if (existing.user_id !== user.id) throw new Error('No tienes permiso para editar esta cita')
  if (['cancelled', 'completed'].includes(existing.status))
    throw new Error('No puedes editar una cita cancelada o completada')

  const { data, error } = await supabase
    .from('appointments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', appointmentId)
    .select()

  if (error) throw error
  return data
}

// 🔹 Cancela una cita (verificando propiedad)
export const cancelAppointment = async (appointmentId) => {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('No estás autenticado')

  const { data: existing, error: fetchError } = await supabase
    .from('appointments')
    .select('user_id, status')
    .eq('id', appointmentId)
    .single()

  if (fetchError) throw fetchError
  if (!existing) throw new Error('Cita no encontrada')
  if (existing.user_id !== user.id) throw new Error('No tienes permiso para cancelar esta cita')
  if (['cancelled', 'completed'].includes(existing.status))
    throw new Error('La cita ya está cancelada o completada')

  const { data, error } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', appointmentId)
    .select()

  if (error) throw error
  return data
}

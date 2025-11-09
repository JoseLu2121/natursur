import { supabase } from './supabaseClient'

// crea una cita para el usuario autenticado
export const createAppointment = async ({ appointment_type_id, start_at, end_at, staffId, userId }) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
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
        user_id: userId || user.id // usa el que venga o el actual
      }
    ])
    .select()

  if (error) throw error
  return data
}

// crea múltiples citas para el usuario autenticado
export const createMultipleAppointments = async (appointments) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('No estás autenticado')

  if (!Array.isArray(appointments) || appointments.length === 0) {
    throw new Error('Debes enviar un array de citas')
  }

  const formattedAppointments = appointments.map(appt => ({
    user_id: appt.userId || user.id, // ✅ usa el user.id real
    appointment_type_id: appt.appointment_type_id,
    start_at: appt.start_at,
    end_at: appt.end_at,
    status: 'booked',
    staff_id: appt.staffId
  }))

  const { data, error } = await supabase
    .from('appointments')
    .insert(formattedAppointments)
    .select()

  if (error) throw error
  return data
}

// 🔹 Carga una cita por su ID (para edición, etc.)
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


// obtiene las citas de un usuario por su ID
export const getAppointmentsByUser = async (userId) => {
  if (!userId) throw new Error('Falta userId')

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      start_at,
      end_at,
      status,
      appointment_type:appointment_types(name)
    `)
    .eq('user_id', userId)
    .order('start_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}



// edita una cita (solo si pertenece al usuario actual)
export const updateAppointment = async (appointmentId, updates) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('No estás autenticado')

  // aseguramos que el usuario sea dueño de la cita
  const { data: existing, error: fetchError } = await supabase
    .from('appointments')
    .select('user_id, status')
    .eq('id', appointmentId)
    .single()

  if (fetchError) throw fetchError
  if (!existing) throw new Error('Cita no encontrada')
  if (existing.user_id !== user.id) throw new Error('No tienes permiso para editar esta cita')
  if (existing.status === 'cancelled' || existing.status === 'completed')
    throw new Error('No puedes editar una cita cancelada o completada')

  const { data, error } = await supabase
    .from('appointments')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', appointmentId)
    .select()

  if (error) throw error
  return data
}

export const cancelAppointment = async (appointmentId) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('No estás autenticado')

  // verificar propiedad
  const { data: existing, error: fetchError } = await supabase
    .from('appointments')
    .select('user_id, status')
    .eq('id', appointmentId)
    .single()

  if (fetchError) throw fetchError
  if (!existing) throw new Error('Cita no encontrada')
  if (existing.user_id !== user.id) throw new Error('No tienes permiso para cancelar esta cita')
  if (existing.status === 'cancelled' || existing.status === 'completed')
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
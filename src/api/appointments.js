import { supabase } from './supabaseClient'

// ------------------------------------------------------------------
// 🛠️ HELPER: Sincronizar con Google Calendar (Llama a la Edge Function)
// ------------------------------------------------------------------
const syncWithGoogleCalendar = async (appointmentId) => {
  try {
    console.log(`🔄 Sincronizando cita ${appointmentId} con Google Calendar...`)
    
    const { data, error } = await supabase.functions.invoke('create-calendar-eveny', {
      body: { appointment_id: appointmentId }
    })

    if (error) throw error
    console.log('✅ Cita sincronizada con Google:', data)
    
  } catch (error) {
    // Solo logueamos el error, no lanzamos excepción para no romper el flujo del usuario
    console.error('⚠️ Error al sincronizar con Google Calendar (La cita sí se guardó en DB):', error)
  }
}

// ------------------------------------------------------------------
// 🔹 Crea una cita para el usuario autenticado
// ------------------------------------------------------------------
export const createAppointment = async ({ appointment_type_id, start_at, end_at, staffId, userId }) => {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('No estás autenticado')

  // 1. Insertar en Supabase DB
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

  // 2. Sincronizar con Google Calendar (si se creó correctamente)
  if (data && data.length > 0) {
    // No usamos 'await' si quieres que sea instantáneo para el usuario (background),
    // pero usamos 'await' si quieres asegurar que se creó antes de cerrar el modal.
    // Aquí uso await para asegurar el orden.
    await syncWithGoogleCalendar(data[0].id)
  }

  return data
}

// ------------------------------------------------------------------
// 🔹 Crea múltiples citas a la vez
// ------------------------------------------------------------------
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

  // 1. Insertar todas en Supabase
  const { data, error } = await supabase.from('appointments').insert(formattedAppointments).select()

  if (error) throw error

  // 2. Sincronizar todas con Google Calendar
  if (data && data.length > 0) {
    // Usamos Promise.all para enviarlas todas en paralelo y no esperar una por una
    const syncPromises = data.map((appt) => syncWithGoogleCalendar(appt.id))
    await Promise.all(syncPromises)
  }

  return data
}

// ------------------------------------------------------------------
// 🔹 Obtiene todas las citas de un usuario
// ------------------------------------------------------------------
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

// ------------------------------------------------------------------
// 🔹 Carga una cita por ID
// ------------------------------------------------------------------
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

// ------------------------------------------------------------------
// 🔹 Edita una cita (si pertenece al usuario actual)
// ------------------------------------------------------------------
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
  
  // OJO: Si aquí cambias la fecha (start_at/end_at), también deberías actualizar Google Calendar.
  // Eso requeriría otra Edge Function de 'update-calendar-event' o modificar la actual.
  // Por ahora lo dejamos así.

  if (error) throw error
  return data
}

// ------------------------------------------------------------------
// 🔹 Cancela una cita (verificando propiedad)
// ------------------------------------------------------------------
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

  // Aquí también podrías llamar a una Edge Function para borrarla de Google Calendar si quisieras.

  if (error) throw error
  return data
}
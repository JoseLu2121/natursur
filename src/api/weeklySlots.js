import { supabase } from './supabaseClient'

/**
 * Devuelve todos los slots disponibles para un tipo de cita y fecha.
 *
 * @param {number} appointmentTypeId - ID del tipo de cita.
 * @param {string} date - Fecha en formato 'YYYY-MM-DD'.
 * @returns {Promise<Array>} - Lista de slots disponibles.
 */
export const calculateAvailableSlots = async (appointmentTypeId, date) => {
  if (!appointmentTypeId || !date) {
    throw new Error('Faltan parámetros appointmentTypeId o date')
  }

  // 1. Obtener el día de la semana (0 = domingo, 1 = lunes, etc.)
  const dayOfWeek = new Date(date).getDay()

  // 2. Obtener slots predefinidos del tipo y día
  const { data: slots, error: slotsError } = await supabase
    .from('weekly_slots')
    .select('id, start_time, end_time')
    .eq('appointment_type_id', appointmentTypeId)
    .eq('day_of_week', dayOfWeek)

  if (slotsError) throw slotsError

  // 3. Convertir slots en rangos completos de timestamp (fecha y hora)
  const slotTimestamps = slots.map((slot) => ({
    id: slot.id,
    start_at: `${date}T${slot.start_time}Z`,
    end_at: `${date}T${slot.end_time}Z`
  }))

  // 4. Buscar citas existentes para esos horarios
  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select('start_at, end_at')
    .eq('appointment_type_id', appointmentTypeId)
    .gte('start_at', `${date}T00:00:00Z`)
    .lt('end_at', `${date}T23:59:59Z`)

  if (apptError) throw apptError

  // 5. Excluir los rangos temporales ocupados
  const availableSlots = slotTimestamps.filter((slot) => {
    return !appointments.some((appt) => {
      return (
        appt.start_at === slot.start_at && 
        appt.end_at === slot.end_at
      )
    })
  })

  return availableSlots
}

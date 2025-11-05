import { supabase } from './supabaseClient'

/**
 * Calcula los slots disponibles para un tipo de cita y una fecha determinada,
 * teniendo en cuenta la duración de la tarifa seleccionada.
 *
 * @param {number} appointmentTypeId - ID del tipo de cita
 * @param {string} date - Fecha en formato 'YYYY-MM-DD'
 * @param {number} durationMinutes - Duración en minutos de la tarifa seleccionada
 * @returns {Promise<Array>} - Lista de slots disponibles con start_at y end_at
 */
export const calculateAvailableSlots = async (appointmentTypeId, date, durationMinutes, staffId) => {
  if (!appointmentTypeId || !date || !durationMinutes || !staffId) {
    throw new Error('Faltan parámetros appointmentTypeId, date, durationMinutes o staffId')
  }

  // 1. Obtener todos los slots semanales del tipo y masajista
  const { data: weeklySlots, error: slotsError } = await supabase
    .from('weekly_slots')
    .select('id, start_time, end_time')
    .eq('appointment_type_id', appointmentTypeId)
    .eq('staff_id', staffId)

  if (slotsError) throw slotsError

  // 2. Crear sub-slots basados en la duración dentro de cada slot
  const slotSubdivisions = []
  weeklySlots.forEach((slot) => {
    const startTimeParts = slot.start_time.split(':')
    const endTimeParts = slot.end_time.split(':')

    const slotStart = new Date(`${date}T${slot.start_time}Z`)
    const slotEnd = new Date(`${date}T${slot.end_time}Z`)

    let current = new Date(slotStart)
    while (current.getTime() + durationMinutes * 60000 <= slotEnd.getTime()) {
      const next = new Date(current.getTime() + durationMinutes * 60000)
      slotSubdivisions.push({
        slot_id: slot.id,
        start_at: current.toISOString(),
        end_at: next.toISOString()
      })
      current = next
    }
  })

  // 3. Obtener citas ya creadas que se solapan con los sub-slots
  const { data: bookedAppointments, error: bookedError } = await supabase
    .from('appointments')
    .select('start_at, end_at')
    .eq('staff_id', staffId)
    .gte('start_at', `${date}T00:00:00Z`)
    .lte('end_at', `${date}T23:59:59Z`)

  if (bookedError) throw bookedError

  // 4. Filtrar sub-slots que no se solapan con ninguna cita
  const availableSlots = slotSubdivisions.filter((slot) => {
    return !bookedAppointments.some((appt) => {
      return (
        slot.start_at < appt.end_at && slot.end_at > appt.start_at
      )
    })
  })

  return availableSlots
}

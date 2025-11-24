import { supabase } from './supabaseClient'

// Get all users (clients)
export const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// Get a single user by ID
export const getUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

// Create a new client manually (admin/staff only)
// Creates a user record without auth credentials
export const createClient = async (clientData) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        full_name: clientData.full_name,
        phone: clientData.phone,
        role: 'client'
      })
      .select()
      .single()

    if (userError) throw userError
    return userData
  } catch (error) {
    console.error('Error creating client:', error)
    throw error
  }
}

// Update user information
export const updateUser = async (userId, userData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// Delete a user
export const deleteUser = async (userId) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

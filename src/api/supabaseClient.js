import { createClient } from '@supabase/supabase-js'

// Configura tu cliente de Supabase desde las variables de entorno
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

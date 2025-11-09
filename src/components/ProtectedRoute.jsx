import { Navigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';

export default function ProtectedRoute({ children }) {
  const session = supabase.auth.getSession();

  if (!session) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
}
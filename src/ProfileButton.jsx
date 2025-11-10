// src/components/ProfileButton.jsx
import { Link } from 'react-router-dom'

export default function ProfileButton() {
  return (
    <div className="fixed top-4 left-4 z-50">
      <Link
        to="/profile"
        className="bg-gray-100 rounded-full p-3 shadow hover:bg-gray-200 transition flex items-center justify-center"
        title="Mi perfil"
      >
        <span role="img" aria-label="perfil" className="text-xl">
          👤
        </span>
      </Link>
    </div>
  )
}

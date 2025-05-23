#!/usr/bin/env bash

# Moverse a la carpeta src
cd src

# Crear estructura de carpetas
mkdir -p api context hooks components pages/users pages/students pages/courts pages/sessions styles utils

# Archivos en api
touch api/index.js api/auth.js api/users.js api/students.js api/courts.js api/sessions.js

# Context
cat > context/AuthContext.jsx << 'EOF'
import { createContext, useState, useEffect } from 'react'
import { fetchMe, login as loginApi } from '../api/auth'

export const AuthContext = createContext()

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      fetchMe().then(res => setUser(res.data.results))
    }
  }, [token])

  const login = async (email, password) => {
    const { data } = await loginApi({ email, password })
    setToken(data.access_token)
  }
  const logout = () => {
    setToken(null)
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
EOF

# Hooks
cat > hooks/useAuth.js << 'EOF'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
export default function useAuth() {
  return useContext(AuthContext)
}
EOF

cat > hooks/useFetch.js << 'EOF'
import { useState, useEffect } from 'react'

export default function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetcher()
      .then(res => mounted && setData(res.data))
      .catch(err => mounted && setError(err))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, deps)

  return { data, loading, error }
}
EOF

# Components
touch components/ProtectedRoute.jsx components/Navbar.jsx components/Spinner.jsx

# Pages
touch pages/Login.jsx pages/Signup.jsx pages/Dashboard.jsx
touch pages/users/UserList.jsx pages/users/UserDetail.jsx
touch pages/students/StudentList.jsx pages/students/StudentDetail.jsx
touch pages/courts/CourtList.jsx pages/courts/CourtDetail.jsx
touch pages/sessions/SessionList.jsx pages/sessions/SessionDetail.jsx

# Styles & Utils
touch styles/variables.css styles/reset.css
touch utils/date.js utils/helpers.js

echo "✅ Estructura creada en src/"
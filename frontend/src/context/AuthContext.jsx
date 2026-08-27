import { createContext, useContext, useState, useEffect } from 'react'

export const DEMO_PERSONAS = [
  {
    id: 'director',
    name: 'Dr. B. K. Gogoi',
    badge: 'OIL-DIR-101',
    role: 'HSE Fleet Director',
    facility: 'All OIL Assets (Assam HQ)',
    clearance: 'Tier-1 Executive Command',
    avatar: '👑',
    color: '#21D4FD',
    passwords: ['director101', 'oil123', 'admin', 'pass123'],
    defaultHint: 'director101 or oil123'
  },
  {
    id: 'duliajan_lead',
    name: 'Rajesh Barua',
    badge: 'OIL-HSE-9041',
    role: 'Site Safety Engineer',
    facility: 'Duliajan Central Complex',
    clearance: 'Tier-2 Asset Lead',
    avatar: '🛡️',
    color: '#FFB020',
    passwords: ['duliajan9041', 'oil123', 'pass123'],
    defaultHint: 'duliajan9041 or oil123'
  },
  {
    id: 'moran_inspector',
    name: 'Arun Phukan',
    badge: 'OIL-OPS-4412',
    role: 'Field Operations Inspector',
    facility: 'Moran Drilling Rig #4',
    clearance: 'Tier-3 Field Specialist',
    avatar: '👷',
    color: '#27D17F',
    passwords: ['moran4412', 'oil123', 'pass123'],
    defaultHint: 'moran4412 or oil123'
  }
]

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sentinel_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Store registered users in localStorage
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('sentinel_registered_users')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('sentinel_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('sentinel_user')
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem('sentinel_registered_users', JSON.stringify(registeredUsers))
  }, [registeredUsers])

  const login = (badgeOrEmail, password) => {
    if (!badgeOrEmail) {
      return { success: false, message: 'Please enter an OIL Employee / Badge ID' }
    }
    if (!password) {
      return { success: false, message: 'Security clearance passkey is required to access the platform' }
    }

    const cleanInput = badgeOrEmail.trim().toLowerCase()
    const cleanPass = password.trim().toLowerCase()

    // 1. Check Demo Personas
    const matchedPersona = DEMO_PERSONAS.find(
      p => p.badge.toLowerCase() === cleanInput || p.id === cleanInput || p.name.toLowerCase() === cleanInput
    )

    if (matchedPersona) {
      const isPassValid = matchedPersona.passwords.some(p => p.toLowerCase() === cleanPass)
      if (!isPassValid) {
        return { 
          success: false, 
          message: `Authentication Failed: Incorrect passkey for ${matchedPersona.name}. (Hint: ${matchedPersona.defaultHint})` 
        }
      }
      setUser(matchedPersona)
      return { success: true, user: matchedPersona }
    }

    // 2. Check Custom Registered Users
    const customUser = registeredUsers.find(
      u => u.badge.toLowerCase() === cleanInput || u.name.toLowerCase() === cleanInput
    )

    if (customUser) {
      if (customUser.passkey && customUser.passkey.toLowerCase() !== cleanPass) {
        return { success: false, message: 'Authentication Failed: Incorrect security key for registered personnel.' }
      }
      setUser(customUser)
      return { success: true, user: customUser }
    }

    // 3. Dynamic generic login for any custom badge entered
    if (cleanPass.length < 3) {
      return { success: false, message: 'Passkey must be at least 3 characters long.' }
    }

    const newAdHocUser = {
      id: 'custom_' + Date.now(),
      name: badgeOrEmail.includes('@') ? badgeOrEmail.split('@')[0] : badgeOrEmail.toUpperCase(),
      badge: badgeOrEmail.toUpperCase().includes('OIL') ? badgeOrEmail.toUpperCase() : `OIL-AUTH-${Math.floor(1000 + Math.random() * 9000)}`,
      role: 'Authorized Safety Personnel',
      facility: 'Duliajan Central Complex',
      clearance: 'Tier-2 Field Clearance',
      avatar: '🛡️',
      color: '#21D4FD'
    }
    setUser(newAdHocUser)
    return { success: true, user: newAdHocUser }
  }

  const register = (userData) => {
    const newUser = {
      id: 'user_' + Date.now(),
      name: userData.fullName || 'Registered Personnel',
      badge: userData.badgeId ? userData.badgeId.toUpperCase() : `OIL-REG-${Math.floor(1000 + Math.random() * 9000)}`,
      role: userData.role || 'Field Safety Inspector',
      facility: userData.facility || 'Duliajan Central Complex',
      clearance: userData.role?.includes('Director') ? 'Tier-1 Executive Command' : 'Tier-2 Asset Specialist',
      avatar: userData.role?.includes('Director') ? '👑' : userData.role?.includes('Inspector') ? '👷' : '🛡️',
      color: '#21D4FD',
      passkey: userData.passkey || 'oil123',
      isCustomRegistered: true,
      registeredAt: new Date().toISOString()
    }
    setRegisteredUsers(prev => [...prev, newUser])
    setUser(newUser)
    return { success: true, user: newUser }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, demoPersonas: DEMO_PERSONAS }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

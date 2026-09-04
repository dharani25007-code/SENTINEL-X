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
      return saved ? JSON.parse(saved) : DEMO_PERSONAS[0]
    } catch {
      return DEMO_PERSONAS[0]
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('sentinel_user', JSON.stringify(user))
    }
  }, [user])

  const loginAsPersona = (personaId) => {
    const matchedPersona = DEMO_PERSONAS.find(p => p.id === personaId)
    if (matchedPersona) {
      setUser(matchedPersona)
    }
  }

  const logout = () => {
    setUser(DEMO_PERSONAS[0])
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loginAsPersona, logout, demoPersonas: DEMO_PERSONAS }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from '../lib/api'
import { socketManager } from '../lib/socket'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, tableId: string ) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('tabletap_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, tableId: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.login(email, password, tableId)
      const userData = response.data.user
      
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar,
        tableId: userData.tableId,
        isActive: userData.isActive,
        createdAt: new Date(userData.createdAt || Date.now())
      }
      
      setUser(user)
      localStorage.setItem('tabletap_user', JSON.stringify(user))
      
      // Connect to socket
      socketManager.connect(response.data.token)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    apiClient.logout()
    socketManager.disconnect()
    setUser(null)
    localStorage.removeItem('tabletap_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
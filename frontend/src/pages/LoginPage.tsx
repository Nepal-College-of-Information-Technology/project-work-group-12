import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { generateTableId } from '../lib/utils'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tableId, setTableId] = useState('')
  const { login } = useAuth()
  useEffect(() => {
    const id = generateTableId()
    setTableId(id)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password, tableId)
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const demoAccounts = [
    { email: 'admin@tabletap.com', role: 'Admin', color: 'bg-red-500' },
    { email: 'waiter@tabletap.com', role: 'Waiter', color: 'bg-blue-500' },
    { email: 'chef@tabletap.com', role: 'Chef', color: 'bg-green-500' },
    { email: 'customer@tabletap.com', role: 'Customer', color: 'bg-purple-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">TT</span>
              </div>
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-amber-600 bg-clip-text text-transparent">
              TableTap
            </CardTitle>
            <p className="text-slate-600 mt-2">Premium Restaurant Experience</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white/80 backdrop-blur-sm border-slate-200 focus:border-amber-500"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-white/80 backdrop-blur-sm border-slate-200 focus:border-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    Signing In...
                  </motion.div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Demo Accounts</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((account) => (
                  <Button
                    key={account.email}
                    variant="outline"
                    size="sm"
                    onClick={() => setEmail(account.email)}
                    className="h-auto p-2 flex flex-col items-center gap-1 hover:bg-slate-50"
                  >
                    <div className={`w-2 h-2 rounded-full ${account.color}`} />
                    <span className="text-xs">{account.role}</span>
                  </Button>
                ))}
              </div>

              <p className="text-xs text-slate-500 text-center">
                Use any password with demo accounts
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
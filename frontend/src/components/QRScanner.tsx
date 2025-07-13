import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wifi, Shield, Clock, CheckCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

interface QRScannerProps {
  onScanComplete: (tableId: string) => void
}

export function QRScanner({ onScanComplete }: QRScannerProps) {
  const [step, setStep] = useState(1)
  const [isConnecting, setIsConnecting] = useState(false)
  const [tableId, setTableId] = useState('')

  const wifiCredentials = {
    ssid: "TableTap_Premium",
    password: "Welcome2024"
  }

  useEffect(() => {
    // Simulate QR scan result
    const scannedTableId = 'T' + Math.random().toString(36).substr(2, 6).toUpperCase()
    setTableId(scannedTableId)
  }, [])

  const handleWifiConnect = async () => {
    setIsConnecting(true)
    // Simulate WiFi connection
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsConnecting(false)
    setStep(2)
  }

  const handleProceed = () => {
    onScanComplete(tableId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center p-4">
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
              className="mx-auto mb-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <Wifi className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-amber-600 bg-clip-text text-transparent">
              Welcome to TableTap
            </CardTitle>
            <CardDescription className="text-base">
              Table {tableId} • Premium Dining Experience
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-amber-800">Secure WiFi Connection</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Network:</span>
                      <span className="font-mono font-medium">{wifiCredentials.ssid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Password:</span>
                      <span className="font-mono font-medium">{wifiCredentials.password}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Badge variant="luxury" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    PCI DSS Compliant
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Real-time Updates
                  </Badge>
                </div>

                <Button
                  onClick={handleWifiConnect}
                  disabled={isConnecting}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200"
                >
                  {isConnecting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      Connecting...
                    </motion.div>
                  ) : (
                    <>
                      <Wifi className="w-5 h-5 mr-2" />
                      Connect to WiFi
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Connected Successfully!
                  </h3>
                  <p className="text-slate-600">
                    You're now connected to our premium WiFi network. Ready to explore our menu?
                  </p>
                </div>

                <Button
                  onClick={handleProceed}
                  className="w-full h-12 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-medium rounded-lg shadow-lg transition-all duration-200"
                >
                  Explore Menu
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
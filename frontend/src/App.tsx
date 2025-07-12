import React, { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { OrderProvider } from './contexts/OrderContext'
import { useAuth } from './contexts/AuthContext'
import { QRScanner } from './components/QRScanner'
import { NotificationSystem } from './components/NotificationSystem'
import { LoginPage } from './pages/LoginPage'
import { CustomerPage } from './pages/CustomerPage'
import { AdminPage } from './pages/AdminPage'
import { WaiterPage } from './pages/WaiterPage'
import { ChefPage } from './pages/ChefPage'

function AppContent() {
  const { user } = useAuth()
  const [hasScannedQR, setHasScannedQR] = useState(false)
  const [tableId, setTableId] = useState('')

  const handleQRScanComplete = (scannedTableId: string) => {
    setTableId(scannedTableId)
    setHasScannedQR(true)
  }

  // If no user is logged in, show login page
  if (!user) {
    return <LoginPage />
  }

  // If user is customer and hasn't scanned QR, show QR scanner
  if (user.role === 'customer' && !hasScannedQR) {
    return <QRScanner onScanComplete={handleQRScanComplete} />
  }

  // Route based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminPage />
      case 'waiter':
        return <WaiterPage />
      case 'chef':
        return <ChefPage />
      case 'customer':
        return <CustomerPage />
      default:
        return <LoginPage />
    }
  }

  return (
    <>
      {renderDashboard()}
      <NotificationSystem />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <AppContent />
      </OrderProvider>
    </AuthProvider>
  )
}

export default App
import './App.css'
import { Navigate, Route, Routes } from 'react-router'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Pages
import Home from './pages/Home'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import QRForm from './pages/QRForm'
import QRScanner from './pages/QRScanner'
import HackathonForm from './pages/HackathonForm'
import QRDashboard from './pages/QRDashboard'
import HackDashboard from './pages/HackDashboard'
import Attd from './pages/Attd'
import HackAttd from './pages/HackAttd'
import Payement from './pages/Payement'
import Marks from './pages/Marks'
import socket from './lib/socket'
import { useEffect } from 'react'
import Update from './pages/Update'

function AppContent() {
  const { user, loading } = useAuth();

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium tracking-wide">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
        <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path='/qr' element={<ProtectedRoute><QRForm /></ProtectedRoute>} />
        <Route path='/hackthon' element={<ProtectedRoute><HackathonForm /></ProtectedRoute>} />
        <Route path='/qr/scanner/:event' element={<QRScanner />} />
        <Route path='/dashboard/qr/:event' element={<QRDashboard />} />
        <Route path='/dashboard/hack/:event' element={<ProtectedRoute><HackDashboard /></ProtectedRoute>} />
        <Route path='/attd/:event' element={<ProtectedRoute><Attd /></ProtectedRoute>} />
        <Route path='/attd/hack/:event' element={<ProtectedRoute><HackAttd /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path='/payment/:event' element={<Payement />} />
        <Route path='/update/:eventId' element={<Update />} />
        <Route path='/marks/:event' element={<Marks />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

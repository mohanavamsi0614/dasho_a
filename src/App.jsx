import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import EventLayout from "./layout/Layout"
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
import Update from './pages/Update'
import socket from './lib/socket'
import { useEffect } from 'react'

function AppContent() {
  const { user, loading } = useAuth();

  useEffect(() => {
    socket.connect();
    return () => socket.disconnect();
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
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/auth"
          element={user ? <Navigate to="/" replace /> : <Auth />}
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/qr"
          element={
            <ProtectedRoute>
              <QRForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hackthon"
          element={
            <ProtectedRoute>
              <HackathonForm />
            </ProtectedRoute>
          }
        />

        <Route path="/hack/:event" element={<EventLayout />}>
          <Route index element={<HackDashboard />} />
          <Route
            path="attd"
            element={
              <HackAttd />
            }
          />
          <Route path="payment" element={<Payement />} />
          <Route path="update" element={<Update />} />
          <Route path="marks" element={<Marks />} />
        </Route>

        {/* QR EVENT ROUTES */}
        <Route path="/qr/:event" element={<EventLayout />}>
          <Route index element={<QRDashboard />} />
          <Route path="scanner" element={<QRScanner />} />
          <Route
            path="attd"
            element={
              <ProtectedRoute>
                <Attd />
              </ProtectedRoute>
            }
          />
          <Route path="payment" element={<Payement />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import EventLayout from "./layout/Layout"
import Home from './pages/Home'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import QRForm from './pages/qr/Form'
import QRScanner from './pages/qr/Scanner'
import HackathonCreate from './pages/hackathon/Create'
import QRDashboard from './pages/qr/Dashboard'
import HackDashboard from './pages/hackathon/Dashboard'
import Attd from './pages/qr/Attendance'
import HackAttd from './pages/hackathon/Attendance'
import Payement from './pages/hackathon/Payment'
import Marks from './pages/hackathon/Marks'
import Update from './pages/hackathon/Update'
import socket from './lib/socket'
import { useEffect } from 'react'
import HackProblemStatements from './pages/hackathon/ProblemStatements'
import HackEvent from './pages/hackathon/Event'
import HackathonEdit from './pages/hackathon/Edit'

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
              <HackathonCreate />
            </ProtectedRoute>
          }
        />

        <Route path="/hack/:event" element={<EventLayout />}>
          <Route index element={<HackEvent />} />
          <Route path="edit" element={<HackathonEdit />} />
          <Route path='dashboard' element={<HackDashboard />} />
          <Route
            path="attd"
            element={
              <HackAttd />
            }
          />
          <Route path="payment" element={<Payement />} />
          <Route path="update" element={<Update />} />
          <Route path="marks" element={<Marks />} />
          <Route path="problem-statements" element={<HackProblemStatements />} />
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

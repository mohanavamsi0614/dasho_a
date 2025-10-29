import './App.css'
import { Navigate, Route, Routes } from 'react-router'
import Home from './Home'
import Auth from './Auth'
import Profile from './Profile'
import QRForm from './qrForm'
import QRScanner from './QrScanner'
import HackthonForm from './HackthonForm'
import QrDashboard from './QrDashboard'
import HackDashboard from './HackDashboard'
import Attd from './Attd'
import { useEffect, useState } from 'react'


function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user ? children : <Navigate to="/auth" replace />;
}


function App() {
    const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);



  useEffect(() => {
    // Simulate startup loading
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(storedUser);
    const timer = setTimeout(() => setLoading(false), 500); // half-second load
    return () => clearTimeout(timer);
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
    <Routes>
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route path='/profile' element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
      <Route path='/qr' element={<ProtectedRoute><QRForm/></ProtectedRoute>}/>
      <Route path='/hackthon' element={<ProtectedRoute><HackthonForm/></ProtectedRoute>} />
      <Route path='/qr/scanner/:event' element={<QRScanner/>} />
      <Route path='/dashboard/qr/:event' element={<QrDashboard/>} />
      <Route path='/dashboard/hack/:event' element={<ProtectedRoute><HackDashboard/></ProtectedRoute>} />
      <Route path='/attd/:event' element={<ProtectedRoute><Attd/></ProtectedRoute>} />
         <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default App

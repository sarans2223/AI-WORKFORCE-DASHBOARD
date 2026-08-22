import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminShell from './components/layout/AdminShell'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import Students from './pages/Students'
import Leaves from './pages/Leaves'
import Passes from './pages/Passes'
import Assign from './pages/Assign'
import Admins from './pages/Admins'
import { useAdminAuth } from './contexts/AdminAuthContext'
import { AdminAuthProvider } from './contexts/AdminAuthContext'

function ProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!admin) return <Navigate to="/login" replace />
  return (
    <AdminShell adminName={admin.name}>
      {children}
    </AdminShell>
  )
}

function AppRoutes() {
  const { admin, loading } = useAdminAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return (
    <Routes>
      <Route path="/login" element={admin ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
      <Route path="/leaves" element={<ProtectedRoute><Leaves /></ProtectedRoute>} />
      <Route path="/passes" element={<ProtectedRoute><Passes /></ProtectedRoute>} />
      <Route path="/assign" element={<ProtectedRoute><Assign /></ProtectedRoute>} />
      <Route path="/admins" element={<ProtectedRoute><Admins /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AppRoutes />
      </AdminAuthProvider>
    </BrowserRouter>
  )
}

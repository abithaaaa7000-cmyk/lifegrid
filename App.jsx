import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedLayout from './components/ProtectedLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import FamilyAssessment from './pages/FamilyAssessment.jsx'
import ShockCascade from './pages/ShockCascade.jsx'
import InterventionOptimization from './pages/InterventionOptimization.jsx'
import ActionReassessment from './pages/ActionReassessment.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/family" element={<FamilyAssessment />} />
        <Route path="/shock-cascade" element={<ShockCascade />} />
        <Route path="/intervention" element={<InterventionOptimization />} />
        <Route path="/action-review" element={<ActionReassessment />} />
      </Route>
    </Routes>
  )
}
